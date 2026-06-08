import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
from pathlib import Path

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "inference_outputs"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Баптаулар
plt.rcParams.update({
    "figure.facecolor": "white",
    "axes.facecolor": "white",
    "text.color": "#333333",
    "font.family": "sans-serif",
})

fig, ax = plt.subplots(figsize=(16, 6))
ax.set_xlim(0, 3)
ax.set_ylim(0, 1)
ax.axis('off')

# Карточкалардың түстері мен тақырыптары
cards_data = [
    {
        "title": "1️⃣ Squat (Отырып тұру)",
        "color": "#E8F8F5",
        "edge": "#1ABC9C",
        "text": (
            "• Тізе бұрышы (Knee Angle):\n"
            "Жамбас, тізе және тобық\n"
            "нүктелері арқылы есептеледі\n"
            "(90 градусқа дейін жетуі керек).\n\n"
            "• Арқаның түзулігі:\n"
            "Иық пен жамбас арасындағы\n"
            "көлбеулік (алға еңкейіп\n"
            "кетпеуін бақылаймыз)."
        )
    },
    {
        "title": "2️⃣ Push-up (Жерден қисаю)",
        "color": "#EBF5FB",
        "edge": "#3498DB",
        "text": (
            "• Шынтақ бұрышы:\n"
            "Иық, шынтақ және білезік\n"
            "нүктелерінен есептеледі (денені\n"
            "қаншалықты төмен түсіргенін\n"
            "бақылайды).\n\n"
            "• Дененің бір сызықта болуы:\n"
            "Иық, жамбас және өкше\n"
            "нүктелерінің бір түзуде\n"
            "(180 градус) жатуын тексереді."
        )
    },
    {
        "title": "3️⃣ Lunge (Алға қадам басу)",
        "color": "#FEF9E7",
        "edge": "#F1C40F",
        "text": (
            "• Екі тізенің бұрышы:\n"
            "Алдыңғы тізе 90 градус\n"
            "болуы, ал артқы тізе\n"
            "жерге тимей тұруы\n"
            "бақыланады.\n\n"
            "• Дене симметриясы:\n"
            "Сол және оң жақ иық\n"
            "пен жамбастың ауытқуы\n"
            "мен балансы есептеледі."
        )
    }
]

# 3 Карточканы салу
for i, card in enumerate(cards_data):
    # Фондық карточка
    bbox = FancyBboxPatch((i + 0.05, 0.05), 0.9, 0.85, 
                          boxstyle="round,pad=0.05", 
                          fc=card["color"], ec=card["edge"], lw=2)
    ax.add_patch(bbox)
    
    # Тақырыбы
    ax.text(i + 0.5, 0.82, card["title"], ha='center', va='center', 
            fontsize=16, fontweight='bold', color="#2C3E50")
    
    # Негізгі мәтін
    ax.text(i + 0.1, 0.72, card["text"], ha='left', va='top', 
            fontsize=14, color="#34495E", linespacing=1.6)

plt.tight_layout()
output_path = OUTPUT_DIR / "biomechanics_cards.png"
plt.savefig(output_path, dpi=300, bbox_inches="tight")
plt.close()

print(f"Сурет сақталды: {output_path}")
