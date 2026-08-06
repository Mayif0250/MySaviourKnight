from PIL import Image, ImageDraw, ImageFont
import os

size = 1024
img = Image.new('RGB', (size, size), color=(20, 20, 20))
d = ImageDraw.Draw(img)
# Simple logo
d.text((size//2, size//2), "MSK", fill=(255,255,255), anchor="mm")
img.save("app-icon.png")
