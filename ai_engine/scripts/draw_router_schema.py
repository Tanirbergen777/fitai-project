import matplotlib.pyplot as plt
import matplotlib.patches as patches
from pathlib import Path

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "inference_outputs"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
output_path = OUTPUT_DIR / "router_schema.png"

fig, ax = plt.subplots(figsize=(14, 8))
ax.set_xlim(0, 14)
ax.set_ylim(0, 8)
ax.axis('off')

# Colors
bg_color = "#f8f9fa"
hub_color = "#27ae60"
card_colors = {
    "/users": "#3498db",
    "/nutrition": "#e67e22",
    "/workouts": "#e74c3c",
    "/vision": "#16a085",
    "/chat": "#8e44ad",
    "/analytics": "#f1c40f",
    "/motivation": "#c0392b"
}

fig.patch.set_facecolor(bg_color)

def draw_box(ax, x, y, width, height, text, title, bg_c, text_c="white"):
    box = patches.FancyBboxPatch((x, y), width, height, boxstyle="round,pad=0.1", 
                                 ec="none", fc=bg_c, mutation_scale=0.2)
    ax.add_patch(box)
    
    # Title
    ax.text(x + width/2, y + height/2 + 0.15, title, 
            ha='center', va='center', fontsize=14, fontweight='bold', color=text_c, family='sans-serif')
    # Desc
    ax.text(x + width/2, y + height/2 - 0.15, text, 
            ha='center', va='center', fontsize=10, color=text_c, family='sans-serif', wrap=True)
    
    return (x + width/2, y + height) # top center
    
def draw_arrow(ax, start_x, start_y, end_x, end_y):
    ax.annotate("",
                xy=(end_x, end_y), xycoords='data',
                xytext=(start_x, start_y), textcoords='data',
                arrowprops=dict(arrowstyle="->", color="#95a5a6", lw=2, connectionstyle="angle,angleA=0,angleB=90,rad=10"))

# HUB
hub_x, hub_y, hub_w, hub_h = 5.5, 6.5, 3.0, 1.0
draw_box(ax, hub_x, hub_y, hub_w, hub_h, "api/main.py", "⚙️ FastAPI Application", hub_color)
hub_bottom = (hub_x + hub_w/2, hub_y)

# ROUTERS
routers = [
    {"title": "👤 /users", "desc": "Auth, JWT, Профиль", "pos": (1, 4), "color": card_colors["/users"]},
    {"title": "📈 /analytics", "desc": "Прогресс, Салмақ", "pos": (5.5, 4), "color": card_colors["/analytics"]},
    {"title": "🔥 /motivation", "desc": "Рейтинг, Streak", "pos": (10, 4), "color": card_colors["/motivation"]},
    
    {"title": "🍎 /nutrition", "desc": "Тамақтану (AI)", "pos": (0.5, 1.5), "color": card_colors["/nutrition"]},
    {"title": "🏋️ /workouts", "desc": "Жаттығу тарихы", "pos": (4, 1.5), "color": card_colors["/workouts"]},
    {"title": "📷 /vision", "desc": "MediaPipe (3D)", "pos": (7.5, 1.5), "color": card_colors["/vision"]},
    {"title": "🤖 /chat", "desc": "Groq Llama 3.3", "pos": (11, 1.5), "color": card_colors["/chat"]},
]

for r in routers:
    x, y = r["pos"]
    w, h = 2.5, 0.8
    text_c = "black" if r["title"].startswith("📈") else "white"
    draw_box(ax, x, y, w, h, r["desc"], r["title"], r["color"], text_c)
    
    # Draw line from Hub bottom to box top
    box_top = (x + w/2, y + h)
    
    # We use custom elbow arrows
    ax.annotate("",
            xy=box_top, xycoords='data',
            xytext=hub_bottom, textcoords='data',
            arrowprops=dict(arrowstyle="->", color="#7f8c8d", lw=2, 
                            connectionstyle="angle,angleA=90,angleB=0,rad=20"))
    
    # Add include_router text
    mid_x = (hub_bottom[0] + box_top[0]) / 2
    mid_y = (hub_bottom[1] + box_top[1]) / 2
    if y == 4: # first row
        ax.text(mid_x, mid_y + 0.2, "include_router()", fontsize=8, color="#7f8c8d", ha="center")

plt.title("Backend Modular Architecture (7 Routers)", fontsize=18, fontweight="bold", color="#2c3e50", pad=20)
plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor=fig.get_facecolor())
plt.close()

print(f"Схема суреті сақталды: {output_path}")
