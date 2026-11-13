from pathlib import Path
import re

extra_ru = {
  "whoTitle": "Кого хочешь пригласить на свидание?",
  "forHer": "Женщину",
  "forHim": "Мужчину",
  "howOpen": "Как открыть приглашение?",
  "previewOpen": "Так получатель увидит открытие — проверьте в превью",
  "previewAsk": "Нажмите «Да» / «Нет» в превью — так увидит получатель",
  "readyText": "Текст когда время пришло",
  "atTime": "В определённое время",
  "inDelay": "Таймер с открытия",
  "scratchLayer": "Слой для стирания",
  "scratchColor": "Цвет",
  "envelopeHintTitle": "Подсказка",
  "envelopeLabel": "Текст под конвертом",
  "mediaImages": "Картинки",
  "mediaVoice": "Голосовое",
  "mediaCircle": "Кружок",
  "imageOnScreen": "Картинка на экране",
  "morePresets": "Ещё",
  "uploadOwn": "Загрузить свой файл",
  "uploadHint": "Фото до 10 МБ",
  "titleAndButtons": "Заголовок и кнопки",
  "yesButton": "Кнопка «Да»",
  "noButton": "Кнопка «Нет»",
  "buttonAnim": "Анимация кнопок",
  "yesAnim": "Анимация «Да»",
  "noAnim": "Анимация «Нет»",
  "animBurst": "Тряска и взрыв",
  "animNone": "Без анимации",
  "animRun": "Убегает",
  "animShrink": "Уменьшение",
  "confirmTitle": "Настрой экран подтверждения",
  "confirmButton": "Кнопка подтверждения",
  "whenTitle": "Настрой экран даты и времени",
  "whoPicks": "Кто выбирает дату и время",
  "letThem": "Пусть выберет сама",
  "iSet": "Указать свою дату и время",
  "whenButton": "Текст кнопки",
  "chooseTitle": "Настрой экран выбора",
  "chooseHelp": "Выбери 1 вариант и настрой под себя",
  "onePack": "1 вариант",
  "manyPacks": "Несколько вариантов",
  "screenTitle": "Заголовок экрана",
  "telegram": "Ваш Telegram",
  "telegramHelp": "Нужен для получения ссылки и ответов в Telegram-боте.",
  "telegramPlaceholder": "@username",
  "recreate": "Создать заново",
  "continue": "Продолжить",
  "voiceBtn": "Записать голос",
  "videoBtn": "Записать кружок",
}

extra_en = {
  "whoTitle": "Who do you want to invite on a date?",
  "forHer": "A woman",
  "forHim": "A man",
  "howOpen": "How to open the invitation?",
  "previewOpen": "This is how they’ll see the open — check the preview",
  "previewAsk": "Tap Yes / No in the preview — that’s how they’ll see it",
  "readyText": "Text when time is up",
  "atTime": "At a specific time",
  "inDelay": "Timer from opening",
  "scratchLayer": "Scratch layer",
  "scratchColor": "Color",
  "envelopeHintTitle": "Hint",
  "envelopeLabel": "Text under the envelope",
  "mediaImages": "Images",
  "mediaVoice": "Voice",
  "mediaCircle": "Circle",
  "imageOnScreen": "Image on screen",
  "morePresets": "More",
  "uploadOwn": "Upload your file",
  "uploadHint": "Photo up to 10 MB",
  "titleAndButtons": "Title and buttons",
  "yesButton": "Yes button",
  "noButton": "No button",
  "buttonAnim": "Button animations",
  "yesAnim": "Yes animation",
  "noAnim": "No animation",
  "animBurst": "Shake and burst",
  "animNone": "No animation",
  "animRun": "Runs away",
  "animShrink": "Shrinks",
  "confirmTitle": "Set up the confirmation screen",
  "confirmButton": "Confirm button",
  "whenTitle": "Set up the date and time screen",
  "whoPicks": "Who picks the date and time",
  "letThem": "Let them choose",
  "iSet": "Set my own date and time",
  "whenButton": "Button text",
  "chooseTitle": "Set up the choice screen",
  "chooseHelp": "Pick 1 option and customize it",
  "onePack": "1 option",
  "manyPacks": "Several options",
  "screenTitle": "Screen title",
  "telegram": "Your Telegram",
  "telegramHelp": "Needed for the link and answers in the Telegram bot.",
  "telegramPlaceholder": "@username",
  "recreate": "Create again",
  "continue": "Continue",
  "voiceBtn": "Record voice",
  "videoBtn": "Record circle",
}

yes_ru = """  yesModes: {
    burst: { title: "Тряска и взрыв", text: "После нажатия — сердца" },
    none: { title: "Без анимации", text: "Простой переход" }
  },
"""
yes_en = """  yesModes: {
    burst: { title: "Shake and burst", text: "Hearts after tap" },
    none: { title: "No animation", text: "Simple continue" }
  },
"""

open_ru = """  openModes: {
    now: { title: "Сразу к приглашению", text: "Без дополнительного экрана" },
    timer: { title: "Откроется в выбранное время", text: "Обратный отсчёт до открытия" },
    scratch: { title: "Стереть фон", text: "Гость стирает слой пальцем" },
    envelope: { title: "Конверт", text: "Конверт с анимацией" },
    pin: { title: "Код из цифр", text: "Вопрос и ответ-число" }
  },
"""
open_en = """  openModes: {
    now: { title: "Straight to invite", text: "No extra screen" },
    timer: { title: "Opens at a set time", text: "Countdown until open" },
    scratch: { title: "Scratch background", text: "They wipe the layer with a finger" },
    envelope: { title: "Envelope", text: "Envelope with animation" },
    pin: { title: "Digit code", text: "A question and number answer" }
  },
"""

no_ru_extra = '    none: { title: "Без анимации", text: "Обычная кнопка" },\n'
no_en_extra = '    none: { title: "No animation", text: "Normal button" },\n'

def patch(path, steps, extra, yes_block, open_block, no_extra):
  text = path.read_text(encoding="utf-8")
  text = re.sub(r"steps: \[[^\]]+\],", f"steps: {steps},", text, count=1)
  # inject keys before closing of create
  inject = "".join([f'    {k}: "{v}",\n' for k, v in extra.items()])
  text = text.replace("    inAppHint:", inject + "    inAppHint:", 1)
  if "yesModes:" not in text:
    text = text.replace("  openModes:", yes_block + "  openModes:", 1)
  text = re.sub(r"  openModes: \{.*?^\  \},", open_block.rstrip() + "\n", text, count=1, flags=re.S|re.M)
  if "none: { title:" not in text.split("noModes:")[1].split("delays:")[0]:
    text = text.replace("  noModes: {\n", "  noModes: {\n" + no_extra, 1)
  path.write_text(text, encoding="utf-8")
  print("patched", path)

patch(
  Path(r"c:\Users\HP\Desktop\teplo\lib\i18n\ru.js"),
  '["Кому", "Открытие", "Вопрос", "Подтверждение", "Когда", "Выбор", "Финал", "Telegram"]',
  extra_ru, yes_ru, open_ru, no_ru_extra
)
patch(
  Path(r"c:\Users\HP\Desktop\teplo\lib\i18n\en.js"),
  '["Who", "Open", "Question", "Confirm", "When", "Choices", "Finale", "Telegram"]',
  extra_en, yes_en, open_en, no_en_extra
)
