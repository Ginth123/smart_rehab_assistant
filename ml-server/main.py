# ml-server/main.py
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd

app = FastAPI()

# 启动时加载刚才训练好的模型
model_A = joblib.load('model_recovery_days.pkl')
model_B = joblib.load('model_daily_plan.pkl')

# 定义前端传入的数据结构
class PredictionRequest(BaseModel):
    age: int
    phase: int # 1:急性, 2:修复, 3:重塑
    consecutive_days: int
    avg_perf: float
    avg_pain: float

class RecommendationRequest(BaseModel):
    injury_type: int # 1:挫伤, 2:拉伤
    phase: int
    yesterday_pain: float
    yesterday_perf: float
    today_emotion: int # 1:消极, 2:平稳, 3:积极

@app.post("/api/ml/predict-days")
def predict_days(data: PredictionRequest):
    # 构建 DataFrame 预测
    df = pd.DataFrame([data.dict()])
    predicted_days = model_A.predict(df)[0]
    return {"predicted_days": max(1, int(predicted_days))}

@app.post("/api/ml/recommend-plan")
def recommend_plan(data: RecommendationRequest):
    df = pd.DataFrame([data.dict()])
    strategy_code = model_B.predict(df)[0]
    
    # 将模型输出的数字转换为具体的训练计划
    strategies = {
        0: {
            "strategy": "保守恢复 (降级)",
            "reason": "AI监测到您昨日疼痛较高或情绪欠佳，今日已自动降低训练强度，请以舒缓为主。",
            "exercises": [{"name": "极轻柔关节微动", "focus": "无痛范围内活动"}, {"name": "冥想与呼吸放松", "focus": "缓解痛感神经"}]
        },
        1: {
            "strategy": "常规巩固 (维持)",
            "reason": "各项指标平稳，请继续保持当前的训练节奏。",
            "exercises": [{"name": "患处轻柔主动活动", "focus": "促进血液循环"}, {"name": "患处肌肉等长收缩", "focus": "唤醒肌肉"}, {"name": "周围肌肉轻柔牵伸", "focus": "恢复活动度"}]
        },
        2: {
            "strategy": "强化进阶 (升级)",
            "reason": "AI监测到您状态极佳，身体已具备进入下一阶段强度的条件！",
            "exercises": [{"name": "等张抗阻收缩训练", "focus": "强化核心力量"}, {"name": "本体感觉平衡训练", "focus": "提升稳定性"}]
        }
    }
    
    return strategies[int(strategy_code)]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)