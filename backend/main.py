import os
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from langchain_community.embeddings import HuggingFaceEmbeddings  # 무료 로컬 임베딩!
from typing import List, Optional

app = FastAPI()

# 1. CORS 설정 (리액트와 통신 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ★★★ 여기에 구글 API 키를 입력하세요 ★★★
os.environ["GOOGLE_API_KEY"] = "AIzaSyCCNnKlAaCCMRdh_OETXbdEMLmCrBLR52g"

# 전역 변수
vectorstore = None
loaded_documents_info = []  # PDF 메타데이터 저장

# PDF 파일명에서 국가와 카테고리 추출 함수
def extract_metadata(filename):
    """파일명에서 국가와 카테고리를 스마트하게 추출"""
    filename_lower = filename.lower()
    
    # 국가 감지
    if "canada" in filename_lower:
        country = "Canada"
    elif "france" in filename_lower or "française" in filename_lower or "snbc" in filename_lower or "carbone" in filename_lower:
        country = "France"
    elif "germany" in filename_lower or "klima" in filename_lower or "german" in filename_lower:
        country = "Germany"
    elif "african" in filename_lower or "afdb" in filename_lower:
        country = "Africa"
    elif "un " in filename_lower or "global" in filename_lower or "ndc" in filename_lower:
        country = "Global"
    else:
        country = "Global"
    
    # 카테고리 감지
    if "agri" in filename_lower or "food" in filename_lower:
        category = "Agriculture"
    elif "energy" in filename_lower or "grid" in filename_lower or "renewable" in filename_lower:
        category = "Energy"
    elif "emission" in filename_lower or "carbon" in filename_lower or "climate" in filename_lower or "klima" in filename_lower:
        category = "Climate"
    elif "health" in filename_lower:
        category = "Health"
    elif "supply" in filename_lower or "logistics" in filename_lower:
        category = "Supply Chain"
    else:
        category = "Policy"
    
    # 문서 타입 감지
    if "report" in filename_lower:
        doc_type = "Report"
    elif "plan" in filename_lower or "strategy" in filename_lower or "strategie" in filename_lower:
        doc_type = "Strategy"
    elif "brief" in filename_lower:
        doc_type = "Brief"
    elif "act" in filename_lower or "law" in filename_lower:
        doc_type = "Legislation"
    else:
        doc_type = "Document"
    
    # 년도 추출 시도
    import re
    year_match = re.search(r'20\d{2}', filename)
    year = year_match.group() if year_match else "2023"
    
    return country, category, doc_type, year

# 2. PDF 로드 및 메타데이터 태깅 함수
def load_and_tag_documents():
    global vectorstore, loaded_documents_info
    documents = []
    loaded_documents_info = []  # 초기화
    
    # 절대 경로 사용
    data_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
    
    # 폴더 없으면 생성
    if not os.path.exists(data_folder):
        os.makedirs(data_folder)
        print("📁 'data' 폴더가 생성되었습니다. PDF 파일을 넣어주세요.")
        return

    print("🔄 PDF 로딩 및 태그 분석 시작...")
    
    files = [f for f in os.listdir(data_folder) if f.endswith(".pdf")]
    
    if not files:
        print("⚠️ data 폴더에 PDF 파일이 없습니다.")
        return

    # 모든 파일 로드 (로컬 임베딩 사용하므로 할당량 걱정 없음)
    print(f"📄 총 {len(files)}개 PDF 파일을 로드합니다.")

    for idx, filename in enumerate(files):
        # 스마트 메타데이터 추출
        country_tag, category_tag, doc_type, year = extract_metadata(filename)
        
        try:
            loader = PyPDFLoader(os.path.join(data_folder, filename))
            docs = loader.load()
            
            # 첫 페이지에서 excerpt 추출
            excerpt = docs[0].page_content[:200] + "..." if docs else "No content available."
            
            # 읽은 문서에 태그(꼬리표) 달기
            for doc in docs:
                doc.metadata["country"] = country_tag
                doc.metadata["category"] = category_tag
                doc.metadata["source"] = filename
            
            documents.extend(docs)
            
            # 문서 정보 저장 (프론트엔드용)
            loaded_documents_info.append({
                "id": f"DOC-{idx+1:03d}",
                "filename": filename,
                "title": filename.replace(".pdf", "").replace("-", " ").replace("_", " "),
                "country": country_tag,
                "category": category_tag,
                "type": doc_type,
                "year": year,
                "pages": len(docs),
                "excerpt": excerpt
            })
            
            print(f"   👉 로드 성공: {filename} -> [국가:{country_tag}, 카테고리:{category_tag}]")
        except Exception as e:
            print(f"   ❌ 로드 실패 ({filename}): {e}")

    # 문서가 하나라도 있으면 DB 구축
    if documents:
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(documents)
        
        # 무료 로컬 임베딩 (HuggingFace) - API 할당량 걱정 없음!
        print("🔄 로컬 임베딩 모델 로드 중 (처음엔 다운로드로 시간이 걸릴 수 있음)...")
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        # ChromaDB에 저장
        vectorstore = Chroma.from_documents(splits, embeddings)
        print(f"✅ 총 {len(documents)} 페이지, {len(loaded_documents_info)}개 문서 로드 완료. RAG 준비 끝!")
    else:
        print("⚠️ 로드된 문서가 없습니다.")

# 3. 요청 데이터 모델
class ChatRequest(BaseModel):
    query: str
    country: str = "Global"
    scenario: str = "General"
    language: str = "en"      # en, ko, fr, de

class InsightRequest(BaseModel):
    """AI Strategic Briefing용 인사이트 요청"""
    country: str = "Canada"
    scenario: str = "Health"  # Agri, Energy, Supply, Health
    weather_data: dict = {}   # 현재 기상 데이터
    language: str = "en"      # en, ko, fr, de

# [새로운 핵심 API] AI-Driven Insight 생성
@app.post("/insight")
def generate_insight(req: InsightRequest):
    """
    현재 기상 데이터 + RAG 문서 검색 → LLM이 정책 인사이트 생성
    """
    global vectorstore
    
    # 언어별 설정
    LANG_CONFIG = {
        "en": {"name": "English", "respond_in": "Respond entirely in English."},
        "ko": {"name": "한국어", "respond_in": "모든 응답을 한국어로 작성하세요."},
        "fr": {"name": "Français", "respond_in": "Répondez entièrement en français."},
        "de": {"name": "Deutsch", "respond_in": "Antworten Sie vollständig auf Deutsch."}
    }
    lang_cfg = LANG_CONFIG.get(req.language, LANG_CONFIG["en"])
    
    if not vectorstore:
        return {
            "insight": "정책 문서가 로드되지 않았습니다.",
            "signal": "N/A",
            "status": "ERROR",
            "action": "서버를 재시작하세요",
            "sources": [],
            "key_points": []
        }
    
    # 시나리오별 검색 쿼리 및 분석 포인트 설정
    scenario_config = {
        "Agri": {
            "search_query": f"agriculture climate policy soil moisture drought food security {req.country}",
            "signal_key": "soilMoisture",
            "signal_format": lambda d: f"Soil Moisture: {(d.get('soilMoisture', 0.3) * 100):.1f}%",
            "focus": "농업 정책, 가뭄 대응, 식량 안보"
        },
        "Energy": {
            "search_query": f"energy policy renewable solar wind grid climate {req.country}",
            "signal_key": "solarRad",
            "signal_format": lambda d: f"Solar Radiation: {d.get('solarRad', 0):.1f} MJ/m²",
            "focus": "에너지 전환, 재생에너지, 탄소 배출"
        },
        "Supply": {
            "search_query": f"supply chain logistics climate risk port infrastructure {req.country}",
            "signal_key": "gust",
            "signal_format": lambda d: f"Wind Gusts: {d.get('gust', 0):.1f} km/h",
            "focus": "물류 리스크, 공급망 복원력, 인프라"
        },
        "Health": {
            "search_query": f"public health climate heat wave cold weather policy {req.country}",
            "signal_key": "feelTemp",
            "signal_format": lambda d: f"Apparent Temp: {d.get('feelTemp', 0):.1f}°C",
            "focus": "공중 보건, 기온 극한 대응, 취약계층 보호"
        }
    }
    
    config = scenario_config.get(req.scenario, scenario_config["Health"])
    weather = req.weather_data or {}
    
    # RAG 검색 실행 - 더 많은 문서 검색
    search_kwargs = {
        "k": 8,  # 더 많은 문서 검색
        "filter": {
            "$or": [
                {"country": req.country},
                {"country": "Global"}
            ]
        }
    }
    
    try:
        # 관련 문서 검색
        retriever = vectorstore.as_retriever(search_kwargs=search_kwargs)
        relevant_docs = retriever.get_relevant_documents(config["search_query"])
        
        # 🔥 Deep RAG: 페이지, 섹션 정보를 포함한 정밀 컨텍스트 구축
        detailed_citations = []
        context_text = ""
        
        for idx, doc in enumerate(relevant_docs[:6]):
            source = doc.metadata.get('source', 'Unknown')
            page = doc.metadata.get('page', 'N/A')
            content = doc.page_content[:1000]
            
            # 섹션/헤딩 추출 시도 (문서 내 구조 파악)
            lines = content.split('\n')
            section_hint = ""
            for line in lines[:5]:
                if any(kw in line.lower() for kw in ['chapter', 'section', 'article', '조', '장', '항', 'teil', 'chapitre']):
                    section_hint = line.strip()[:80]
                    break
            
            citation = {
                "doc_id": idx + 1,
                "source": source,
                "page": page,
                "section": section_hint or "Main Content",
                "excerpt": content[:300] + "..." if len(content) > 300 else content
            }
            detailed_citations.append(citation)
            
            context_text += f"""
[Document {idx+1}]
- Source: {source}
- Page: {page}
- Section: {section_hint or 'N/A'}
- Content:
{content}

---
"""
        
        sources = list(set([doc.metadata.get('source', 'Unknown') for doc in relevant_docs]))
        
        # LLM으로 인사이트 생성 (gemini-2.0-flash 사용)
        llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash")
        
        # 🔥 Chain of Thought 프롬프트 - 추론 과정을 명시적으로 요청
        prompt = f"""You are a G7 climate policy analysis AI with deep expertise.
{lang_cfg['respond_in']}

## Current Situation
- Country: {req.country}
- Analysis Scenario: {req.scenario} ({config['focus']})
- Current Weather Data: 
  * Apparent Temp: {weather.get('feelTemp', 'N/A')}°C
  * Actual Temp: {weather.get('realTemp', 'N/A')}°C
  * Soil Moisture: {(weather.get('soilMoisture', 0.3) * 100):.1f}%
  * Precipitation: {weather.get('rain', 0)}mm
  * Solar Radiation: {weather.get('solarRad', 0)} MJ/m²
  * Wind Gusts: {weather.get('gust', 0)} km/h
  * Snowfall: {weather.get('snow', 0)}cm

## Reference Policy Documents (with page numbers)
{context_text}

## CRITICAL INSTRUCTIONS
1. **Micro-Citation Required**: When referencing a policy, you MUST cite the exact document SOURCE FILENAME, page, and section. Example: "According to 'Canada Emission Reduction Plan.pdf', Page 15, Section 3.2..."
2. **Chain of Thought Required**: Show your reasoning step by step. Explain WHY you reached your conclusion.
3. **IMPORTANT**: Always include the FULL source filename in citations, not just document numbers.
4. {lang_cfg['respond_in']}

## Response Format (JSON only):
{{
  "status": "ALERT or CAUTION or STABLE or OPTIMAL",
  "headline": "One-line key insight in {lang_cfg['name']}",
  
  "reasoning_chain": [
    {{
      "step": 1,
      "type": "DATA_OBSERVATION",
      "content": "Observation about current weather data (e.g., 'Soil moisture is at 20.6%, which is below the typical threshold of 30%')"
    }},
    {{
      "step": 2,
      "type": "POLICY_LOOKUP",
      "content": "What the policy document says - MUST mention the actual document filename",
      "citation": {{"doc_id": 3, "page": "42", "section": "4.1", "source": "Canada Emission Reduction Plan.pdf"}}
    }},
    {{
      "step": 3,
      "type": "INFERENCE",
      "content": "Logical inference connecting data and policy (e.g., 'Since current moisture (20.6%) < threshold (25%), drought protocol should be activated')"
    }},
    {{
      "step": 4,
      "type": "CONCLUSION",
      "content": "Final conclusion with recommended action"
    }}
  ],
  
  "micro_citations": [
    {{
      "doc_id": 1,
      "source": "filename.pdf",
      "page": "15",
      "section": "Section 3.2",
      "quote": "Exact quote or paraphrase from the document (max 100 chars)",
      "relevance": "Why this citation matters for current situation"
    }}
  ],
  
  "analysis": "Detailed analysis connecting weather data and policy documents (3-4 sentences, in {lang_cfg['name']})",
  "action": "Specific recommended action in {lang_cfg['name']}",
  "key_points": ["Key point 1", "Key point 2", "Key point 3"],
  "confidence_score": 0.85,
  "policy_relevance": "Which policy document is most relevant and why (in {lang_cfg['name']})"
}}

Output ONLY valid JSON. No markdown, no explanations, just the JSON object.
"""
        
        response = llm.invoke(prompt)
        response_text = response.content.strip()
        
        # JSON 파싱 시도
        import json
        import re
        
        # JSON 블록 추출
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            insight_data = json.loads(json_match.group())
        else:
            insight_data = {
                "status": "STABLE",
                "headline": "분석 중...",
                "analysis": response_text[:300],
                "action": "모니터링 지속",
                "key_points": [],
                "policy_relevance": "",
                "reasoning_chain": [],
                "micro_citations": []
            }
        
        # 🔥 Deep RAG 응답 - Chain of Thought + Micro-Citation 포함
        return {
            "signal": config["signal_format"](weather),
            "status": insight_data.get("status", "STABLE"),
            "headline": insight_data.get("headline", ""),
            "analysis": insight_data.get("analysis", ""),
            "action": insight_data.get("action", ""),
            "key_points": insight_data.get("key_points", []),
            "policy_relevance": insight_data.get("policy_relevance", ""),
            
            # 🆕 Chain of Thought - AI 추론 과정
            "reasoning_chain": insight_data.get("reasoning_chain", []),
            
            # 🆕 Micro-Citations - 정밀 인용
            "micro_citations": insight_data.get("micro_citations", []),
            
            # 🆕 신뢰도 점수
            "confidence_score": insight_data.get("confidence_score", 0.7),
            
            # 기존 필드
            "sources": sources,
            "detailed_citations": detailed_citations,  # 원본 문서 정보
            "scenario": req.scenario,
            "country": req.country
        }
        
    except Exception as e:
        print(f"Insight generation error: {e}")
        import traceback
        traceback.print_exc()
        return {
            "signal": config["signal_format"](weather),
            "status": "ERROR",
            "headline": "Analysis error occurred",
            "analysis": str(e),
            "action": "System check required",
            "key_points": [],
            "reasoning_chain": [],
            "micro_citations": [],
            "confidence_score": 0,
            "sources": [],
            "scenario": req.scenario,
            "country": req.country
        }

# 4. 채팅 API (메타데이터 필터링 적용)
@app.post("/chat")
def chat(req: ChatRequest):
    global vectorstore
    
    # DB가 비어있으면 안내 메시지 반환
    if not vectorstore:
        return {
            "answer": "서버에 로드된 정책 문서가 없습니다. backend/data 폴더에 PDF를 넣고 서버를 재시작해주세요.",
            "sources": []
        }
    
    # [핵심] 검색 필터: 내 국가 문서 OR 글로벌 문서만 찾기
    search_kwargs = {
        "k": 4, # 상위 4개 문서 참조
        "filter": {
            "$or": [
                {"country": req.country}, # 선택한 국가 (예: Canada)
                {"country": "Global"}     # 또는 공통 문서
            ]
        }
    }
    
    # 언어별 설정
    LANG_CONFIG = {
        "en": {"name": "English", "respond_in": "Respond entirely in English."},
        "ko": {"name": "한국어", "respond_in": "모든 응답을 한국어로 작성하세요."},
        "fr": {"name": "Français", "respond_in": "Répondez entièrement en français."},
        "de": {"name": "Deutsch", "respond_in": "Antworten Sie vollständig auf Deutsch."}
    }
    lang_cfg = LANG_CONFIG.get(req.language, LANG_CONFIG["en"])
    
    llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash")
    
    # 프롬프트: 선택된 언어로 전문적인 답변 유도
    template = f"""
    You are a G7 policy advisor.
    Currently analyzing the '{req.scenario}' scenario for '{req.country}'.
    {lang_cfg['respond_in']}
    
    Based on the provided Context, answer the question clearly in {lang_cfg['name']}.
    If the information is not in the context, say you don't know. Don't make things up.
    
    Context: {{context}}
    
    Question: {{question}}
    
    Answer (in {lang_cfg['name']}):
    """
    PROMPT = PromptTemplate.from_template(template)

    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        retriever=vectorstore.as_retriever(search_kwargs=search_kwargs),
        return_source_documents=True,
        chain_type_kwargs={"prompt": PROMPT}
    )
    
    try:
        # 질문 던지기
        result = qa_chain.invoke({"query": req.query})
        
        # 참고한 문서 출처 목록 만들기
        sources = list(set([doc.metadata['source'] for doc in result['source_documents']]))
        
        return {
            "answer": result['result'],
            "sources": sources
        }
    except Exception as e:
        return {
            "answer": f"죄송합니다. 처리 중 오류가 발생했습니다: {str(e)}", 
            "sources": []
        }

# 5. 문서 목록 API - Policy Library용
@app.get("/documents")
def get_documents():
    """Policy Library에서 사용할 문서 목록 반환"""
    return {"documents": loaded_documents_info}

# 6. PDF 파일 서빙 - View Document용
@app.get("/pdf/{filename:path}")
def get_pdf(filename: str):
    """PDF 파일을 브라우저에서 볼 수 있도록 서빙"""
    pdf_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
    file_path = os.path.join(pdf_folder, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="application/pdf", filename=filename)
    return {"error": "File not found"}

# 서버 켜질 때 실행
@app.on_event("startup")
def startup():
    load_and_tag_documents()

if __name__ == "__main__":
    import uvicorn
    # 0.0.0.0으로 열어서 외부 접속 허용
    uvicorn.run(app, host="0.0.0.0", port=8000)
