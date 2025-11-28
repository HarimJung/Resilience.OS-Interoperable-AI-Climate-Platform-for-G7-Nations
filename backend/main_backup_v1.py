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
os.environ["GOOGLE_API_KEY"] = "AIzaSyAhJ5ZXG8vnnkECvkuXk6mlCrYh5OCY3VQ"

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

class InsightRequest(BaseModel):
    """AI Strategic Briefing용 인사이트 요청"""
    country: str = "Canada"
    scenario: str = "Health"  # Agri, Energy, Supply, Health
    weather_data: dict = {}   # 현재 기상 데이터

# [새로운 핵심 API] AI-Driven Insight 생성
@app.post("/insight")
def generate_insight(req: InsightRequest):
    """
    현재 기상 데이터 + RAG 문서 검색 → LLM이 정책 인사이트 생성
    """
    global vectorstore
    
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
    
    # RAG 검색 실행
    search_kwargs = {
        "k": 5,
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
        
        # 문서 내용 추출
        context_text = "\n\n---\n\n".join([
            f"[출처: {doc.metadata.get('source', 'Unknown')}]\n{doc.page_content[:800]}"
            for doc in relevant_docs[:4]
        ])
        
        sources = list(set([doc.metadata.get('source', 'Unknown') for doc in relevant_docs]))
        
        # LLM으로 인사이트 생성 (gemini-2.0-flash 사용)
        llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash")
        
        prompt = f"""당신은 G7 기후 정책 분석 AI입니다.

## 현재 상황
- 국가: {req.country}
- 분석 시나리오: {req.scenario} ({config['focus']})
- 현재 기상 데이터: 
  * 체감온도: {weather.get('feelTemp', 'N/A')}°C
  * 실제온도: {weather.get('realTemp', 'N/A')}°C
  * 토양수분: {(weather.get('soilMoisture', 0.3) * 100):.1f}%
  * 강수량: {weather.get('rain', 0)}mm
  * 태양복사량: {weather.get('solarRad', 0)} MJ/m²
  * 돌풍: {weather.get('gust', 0)} km/h
  * 적설량: {weather.get('snow', 0)}cm

## 참고 정책 문서 (RAG 검색 결과)
{context_text}

## 요청
위 정책 문서들을 바탕으로, 현재 {req.country}의 기상 상황에 대한 **정책적 인사이트**를 제공하세요.

다음 형식으로 JSON 응답하세요:
{{
  "status": "ALERT 또는 CAUTION 또는 STABLE 또는 OPTIMAL",
  "headline": "핵심 인사이트 한 줄 (한국어)",
  "analysis": "현재 기상 데이터와 정책 문서를 연결한 분석 (3-4문장, 한국어)",
  "action": "권고 조치 (한국어)",
  "key_points": ["핵심 포인트 1", "핵심 포인트 2", "핵심 포인트 3"],
  "policy_relevance": "어떤 정책 문서가 왜 관련 있는지 설명 (한국어)"
}}

JSON만 출력하세요. 다른 텍스트 없이.
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
                "policy_relevance": ""
            }
        
        return {
            "signal": config["signal_format"](weather),
            "status": insight_data.get("status", "STABLE"),
            "headline": insight_data.get("headline", ""),
            "analysis": insight_data.get("analysis", ""),
            "action": insight_data.get("action", ""),
            "key_points": insight_data.get("key_points", []),
            "policy_relevance": insight_data.get("policy_relevance", ""),
            "sources": sources,
            "scenario": req.scenario,
            "country": req.country
        }
        
    except Exception as e:
        print(f"Insight generation error: {e}")
        return {
            "signal": config["signal_format"](weather),
            "status": "ERROR",
            "headline": "분석 중 오류 발생",
            "analysis": str(e),
            "action": "시스템 확인 필요",
            "key_points": [],
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
    
    llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash")
    
    # 프롬프트: 한국어로 전문적인 답변 유도
    template = f"""
    당신은 G7 정책 보좌관입니다.
    현재 '{req.country}' 국가의 '{req.scenario}' 시나리오를 분석 중입니다.
    제공된 문맥(Context)을 바탕으로 질문에 대해 한국어로 명확하게 답변하세요.
    문맥에 없는 내용은 지어내지 말고 모른다고 하세요.
    
    Context: {{context}}
    
    Question: {{question}}
    
    Answer (Korean):
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
