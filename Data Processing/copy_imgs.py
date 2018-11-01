import pandas as pd
import json
from pandas import ExcelWriter
from pandas import ExcelFile
import os
import io
import shutil
from PIL import Image

xls = pd.ExcelFile('/Users/phuonglv/Downloads/phuong.xls')

def copy_rename(old_file_name, new_file_name,source_path,dest_path):
        src_dir= source_path
        dst_dir= dest_path
        if not os.path.exists(dst_dir):
            os.makedirs(dst_dir)
        src_file = os.path.join(src_dir, old_file_name)
        shutil.copy(src_file,dst_dir)
        
        dst_file = os.path.join(dst_dir, old_file_name)
        new_dst_file_name = os.path.join(dst_dir, new_file_name)
        os.rename(dst_file, new_dst_file_name)
def copy_images():
    df = pd.read_excel(xls, sheet_name='Images')
    for _, row in df.iterrows():
        old_file_name=row['img_source']
        new_file_name=row['img_dest']
        source_path=row["img_path_source"]
        dest_path=row['img_path_dest']
        copy_rename(old_file_name, new_file_name,source_path,dest_path)
def resize_imgs():
    df = pd.read_excel(xls, sheet_name='Images')
    for _, row in df.iterrows():
        imageFile = os.path.join(row['img_path_source'],row['img_source'])
        print(imageFile)
        img = Image.open(imageFile)
        # adjust width and height to your needs
        width = 1
        height = 200
        imgz_new = img.resize((width, height), Image.ANTIALIAS)    # best down-sizing filter
        imgz_new.save(imageFile)
def resize_img(img_file):
        img = Image.open(img_file)
        # adjust width and height to your needs
        width = 60
        height = 60
        imgz_new = img.resize((width, height), Image.ANTIALIAS)    # best down-sizing filter
        imgz_new.save(img_file)

def main():
#     copy_images()
#     resize_imgs()
    resize_img("/Users/phuonglv/Desktop/ChatBot/dou-assistant/public/images/project-icon.png")

if __name__ == "__main__":
    main()