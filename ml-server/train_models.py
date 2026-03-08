# ml-server/train_models.py
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib

print("🚀 开始进行模型训练初始化...")

# ==========================================
# Model A：康复周期预测模型 (Regression)
# ==========================================
print("📊 正在生成 [康复周期预测] 数据...")
np.random.seed(42)
n_samples = 1000

# 特征: 年龄(18-65), 当前阶段(1急性,2修复,3重塑), 连续打卡天数(1-30), 近3日平均完成度(0-100), 近3日平均疼痛(0-10)
age = np.random.randint(18, 65, n_samples)
phase = np.random.randint(1, 4, n_samples)
consecutive_days = np.random.randint(1, 30, n_samples)
avg_perf = np.random.uniform(40, 100, n_samples)
avg_pain = np.random.uniform(0, 8, n_samples)

# 目标Y (医学逻辑：年纪大、疼痛高、完成度低、打卡少 = 恢复慢，天数多)
days_to_next_phase = (age * 0.2) + (avg_pain * 3) + ((100 - avg_perf) * 0.5) - (consecutive_days * 0.4) + (phase * 5)
days_to_next_phase = np.maximum(1, np.round(days_to_next_phase + np.random.normal(0, 2, n_samples)))

df_A = pd.DataFrame({'age': age, 'phase': phase, 'consecutive_days': consecutive_days, 'avg_perf': avg_perf, 'avg_pain': avg_pain})
y_A = days_to_next_phase

print("🧠 正在训练 [康复周期预测] 模型...")
model_A = RandomForestRegressor(n_estimators=100, random_state=42)
model_A.fit(df_A, y_A)
joblib.dump(model_A, 'model_recovery_days.pkl')
print("✅ 模型 A 训练完成并保存至 model_recovery_days.pkl")


# ==========================================
# Model B：每日训练推荐模型 (Classification)
# ==========================================
print("\n📊 正在生成 [每日训练推荐] 模拟数据...")
# 特征: 伤情类型(1挫伤, 2拉伤), 阶段(1,2,3), 昨日疼痛(0-10), 昨日完成度(0-100), 今日情绪(1消极, 2平稳, 3积极)
injury_type = np.random.randint(1, 3, n_samples)
yesterday_pain = np.random.uniform(0, 10, n_samples)
yesterday_perf = np.random.uniform(0, 100, n_samples)
today_emotion = np.random.randint(1, 4, n_samples)

# 目标Y (分类标签：0=降级保守(太痛了), 1=维持常规, 2=强化升级(表现极好))
# 医学逻辑：如果昨天很痛(>5)或者今天情绪极差，必须降级；如果表现极好且不痛，则升级。
recommended_strategy = []
for p, perf, e in zip(yesterday_pain, yesterday_perf, today_emotion):
    if p > 5 or e == 1 or perf < 50:
        recommended_strategy.append(0) # 保守
    elif p < 2 and perf > 85 and e == 3:
        recommended_strategy.append(2) # 强化
    else:
        recommended_strategy.append(1) # 常规

df_B = pd.DataFrame({'injury_type': injury_type, 'phase': phase, 'yesterday_pain': yesterday_pain, 'yesterday_perf': yesterday_perf, 'today_emotion': today_emotion})
y_B = np.array(recommended_strategy)

print("🧠 正在训练 [每日训练推荐] 模型...")
model_B = RandomForestClassifier(n_estimators=100, random_state=42)
model_B.fit(df_B, y_B)
joblib.dump(model_B, 'model_daily_plan.pkl')
print("✅ 模型 B 训练完成并保存至 model_daily_plan.pkl\n🎉 所有冷启动模型准备完毕！")