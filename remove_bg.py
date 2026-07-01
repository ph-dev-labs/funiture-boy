from PIL import Image
import sys

def remove_black_bg(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    newData = []
    # threshold for black
    threshold = 40
    for item in datas:
        # if RGB values are all below threshold, it's black/dark gray
        if item[0] < threshold and item[1] < threshold and item[2] < threshold:
            newData.append((255, 255, 255, 0)) # transparent
        else:
            newData.append(item)
            
    img.putdata(newData)
    img.save(output_path, "PNG")

remove_black_bg("/Users/hugoacevedo/Downloads/WhatsApp Image 2026-06-27 at 01.17.26.jpeg", "public/logo.png")
