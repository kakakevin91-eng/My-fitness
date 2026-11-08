// Slot IDs stay fixed when an exercise is swapped, so existing set records remain attached.
export const exerciseLibrary = {
  chestPress: ['器械胸推', 'Machine Chest Press', '胸', 'Chest', '8–12 次', 'chestFly', '啞鈴地板臥推', 'Dumbbell Floor Press'],
  chestFly: ['蝴蝶機夾胸', 'Pec Deck Fly', '胸', 'Chest', '10–15 次', 'chestPress', '啞鈴地板臥推', 'Dumbbell Floor Press'],
  inclinePress: ['上斜器械胸推', 'Incline Machine Press', '上胸', 'Upper chest', '8–12 次', 'chestPress', '上斜啞鈴臥推', 'Incline Dumbbell Press'],
  shoulderPress: ['器械肩推', 'Machine Shoulder Press', '肩', 'Shoulders', '8–12 次', 'lateralRaise', '坐姿啞鈴肩推', 'Seated Dumbbell Press'],
  lateralRaise: ['器械側平舉', 'Machine Lateral Raise', '肩中束', 'Side delts', '12–15 次', 'shoulderPress', '啞鈴側平舉', 'Dumbbell Lateral Raise'],
  reverseFly: ['反向蝴蝶機', 'Reverse Pec Deck', '後肩', 'Rear delts', '12–15 次', 'facePull', '俯身啞鈴飛鳥', 'Bent-over Dumbbell Fly'],
  facePull: ['Cable Face Pull', 'Cable Face Pull', '後肩', 'Rear delts', '12–15 次', 'reverseFly', '彈力帶面拉', 'Band Face Pull'],
  latPulldown: ['高位下拉', 'Lat Pulldown', '背闊肌', 'Lats', '8–12 次', 'assistedPullup', '彈力帶下拉', 'Band Pulldown'],
  assistedPullup: ['輔助引體向上', 'Assisted Pull-up', '背闊肌', 'Lats', '6–10 次', 'latPulldown', '彈力帶輔助引體', 'Band-assisted Pull-up'],
  cableRow: ['坐姿 Cable 划船', 'Seated Cable Row', '中背', 'Mid back', '8–12 次', 'chestSupportedRow', '單臂啞鈴划船', 'Dumbbell Row'],
  chestSupportedRow: ['胸靠式划船機', 'Chest-supported Row', '中背', 'Mid back', '8–12 次', 'cableRow', '單臂啞鈴划船', 'Dumbbell Row'],
  legPress: ['坐姿腿推機', 'Leg Press', '股四頭肌／臀', 'Quads / Glutes', '10–15 次', 'hackSquat', '高腳杯深蹲', 'Goblet Squat'],
  hackSquat: ['Hack Squat 機', 'Hack Squat Machine', '股四頭肌／臀', 'Quads / Glutes', '8–12 次', 'legPress', '高腳杯深蹲', 'Goblet Squat'],
  legExtension: ['坐姿腿伸展', 'Leg Extension', '股四頭肌', 'Quads', '10–15 次', 'legPress', '徒手深蹲', 'Bodyweight Squat'],
  legCurl: ['坐姿腿彎舉', 'Seated Leg Curl', '腿後肌', 'Hamstrings', '10–15 次', 'lyingLegCurl', '啞鈴羅馬尼亞硬拉', 'Dumbbell RDL'],
  lyingLegCurl: ['俯臥腿彎舉', 'Lying Leg Curl', '腿後肌', 'Hamstrings', '10–15 次', 'legCurl', '啞鈴羅馬尼亞硬拉', 'Dumbbell RDL'],
  hipThrust: ['臀推機', 'Hip Thrust Machine', '臀', 'Glutes', '8–12 次', 'gluteKickback', '徒手臀橋', 'Glute Bridge'],
  gluteKickback: ['Cable 臀後踢', 'Cable Glute Kickback', '臀', 'Glutes', '每邊 10–15 次', 'hipThrust', '徒手臀橋', 'Glute Bridge'],
  calfRaise: ['坐姿提踭機', 'Seated Calf Raise', '小腿', 'Calves', '12–15 次', 'standingCalfRaise', '扶牆提踭', 'Standing Calf Raise'],
  standingCalfRaise: ['站立提踭機', 'Standing Calf Raise Machine', '小腿', 'Calves', '12–15 次', 'calfRaise', '扶牆提踭', 'Standing Calf Raise'],
  tricepsPushdown: ['Cable 三頭肌下壓', 'Cable Triceps Pushdown', '三頭肌', 'Triceps', '10–15 次', 'tricepsExtension', '啞鈴三頭肌伸展', 'Dumbbell Triceps Extension'],
  tricepsExtension: ['Cable 過頭三頭肌伸展', 'Cable Overhead Triceps Extension', '三頭肌', 'Triceps', '10–15 次', 'tricepsPushdown', '啞鈴三頭肌伸展', 'Dumbbell Triceps Extension'],
  bicepsCurl: ['Cable 二頭肌彎舉', 'Cable Biceps Curl', '二頭肌', 'Biceps', '10–15 次', 'preacherCurl', '啞鈴彎舉', 'Dumbbell Curl'],
  preacherCurl: ['牧師椅彎舉機', 'Preacher Curl Machine', '二頭肌', 'Biceps', '10–15 次', 'bicepsCurl', '啞鈴彎舉', 'Dumbbell Curl'],
  abCrunch: ['腹肌卷腹機', 'Ab Crunch Machine', '腹直肌', 'Abs', '10–15 次', 'pallofPress', 'Dead Bug', 'Dead Bug'],
  pallofPress: ['Cable Pallof Press', 'Cable Pallof Press', '核心抗旋轉', 'Core', '每邊 8–12 次', 'abCrunch', 'Dead Bug', 'Dead Bug'],
  cableCrunch: ['跪姿 Cable 卷腹', 'Kneeling Cable Crunch', '腹直肌', 'Abs', '10–15 次', 'abCrunch', '仰臥卷腹', 'Floor Crunch'],
  cableWoodChop: ['Cable 伐木式轉體', 'Cable Wood Chop', '腹斜肌／核心', 'Obliques / Core', '每邊 8–12 次', 'pallofPress', '側平板支撐', 'Side Plank']
};

const slot = (key, count = 3) => {
  const item = exerciseLibrary[key];
  return [key, item[0], item[4], count, 60, `https://www.youtube.com/results?search_query=${encodeURIComponent(item[1] + ' exercise form')}`];
};
const routine = (name, focus, keys) => ({name, focus, ex: keys.map(key => slot(key))});

export const gymPlans = {
  gymFullA: routine('全身 A｜Full Body A', '全身 · Full body', ['legPress','chestPress','latPulldown','legCurl','abCrunch']),
  gymFullB: routine('全身 B｜Full Body B', '全身 · Full body', ['hackSquat','inclinePress','cableRow','hipThrust','pallofPress']),
  gymChest: routine('胸肌｜Chest', '胸 · Chest', ['chestPress','inclinePress','chestFly','tricepsPushdown']),
  gymBack: routine('背肌｜Back', '背 · Back', ['latPulldown','cableRow','chestSupportedRow','reverseFly']),
  gymShoulder: routine('肩膊｜Shoulders', '肩 · Shoulders', ['shoulderPress','lateralRaise','reverseFly','facePull']),
  gymQuads: routine('大腿前側｜Quads', '股四頭肌 · Quads', ['legPress','hackSquat','legExtension','calfRaise']),
  gymPosterior: routine('腿後與臀｜Posterior Chain', '腿後／臀 · Hamstrings / Glutes', ['legCurl','lyingLegCurl','hipThrust','gluteKickback']),
  gymArms: routine('手臂｜Arms', '二頭／三頭 · Arms', ['bicepsCurl','tricepsPushdown','preacherCurl','tricepsExtension']),
  gymCore: routine('核心｜Core', '核心 · Core', ['abCrunch','pallofPress','cableCrunch','cableWoodChop']),
  gymUpper: routine('上半身｜Upper Body', '上身 · Upper body', ['chestPress','latPulldown','shoulderPress','cableRow','tricepsPushdown'])
};

export const activePlanIds = [...Object.keys(gymPlans), 'shoulder', 'cardio45'];

export const shoulderDetails = {
  pec: ['Doorway Pec Stretch', '胸肌 · Chest'],
  cat: ['Cat-Cow Stretch', '胸椎／背 · Thoracic spine / Back'],
  yti: ['Prone Y-T-I', '後肩／上背 · Rear delts / Upper back'],
  reverse: ['Reverse Pec Deck Fly', '後肩／上背 · Rear delts / Upper back'],
  face: ['Cable Face Pull', '後肩／上背 · Rear delts / Upper back'],
  circle: ['Dumbbell Shoulder Circles', '肩 · Shoulders'],
  press: ['Seated Dumbbell Shoulder Press', '肩 · Shoulders']
};
