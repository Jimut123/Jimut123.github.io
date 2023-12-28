"""
Author: Jimut Bahan Pal, 17-Jan-2020

Automating script for rescaling images to a given parameter for easy loading.
'Cause I'm bored with manually rescaling all the images.
"""

import cv2
import os
from tqdm import tqdm
from os import listdir
from os.path import isfile, join
from os import walk
import matplotlib.pyplot as plt


print(" Clearing all the *_thumb* files")
os.system('rm *_thumb*')

f = []
for (dirpath, dirnames, filenames) in walk(os.getcwd()):
    f.extend(filenames)
    break

def reshape_image(img_name):
    #img_name = "agartala_2018.jpg"

    img = cv2.imread(img_name, cv2.IMREAD_UNCHANGED)
    thumb_name, exten = img_name.split('.')
     
    print('Original Dimensions : ',img.shape)
     
    # scale_percent = 40 # percent of original size
    # print("RESCALING TO :=> ", scale_percent)
    # width = int(img.shape[1] * scale_percent / 100)
    # height = int(img.shape[0] * scale_percent / 100)
    # dim = (width, height)
    # resize image
    # resized = cv2.resize(img, dim, interpolation = cv2.INTER_AREA)
    SQUARE_ONE_SIDE = 1000
    h,w,_ = img.shape
    if h>SQUARE_ONE_SIDE and w>SQUARE_ONE_SIDE:
        # do the stuff here
        mid_h = int(h/2)
        mid_w = int(w/2)
        cropped_img = img[mid_h-int(SQUARE_ONE_SIDE/2):mid_h+int(SQUARE_ONE_SIDE/2), mid_w-int(SQUARE_ONE_SIDE/2):mid_w+int(SQUARE_ONE_SIDE/2)]
        # plt.imshow(cropped_img)
        # plt.show()
    elif h>SQUARE_ONE_SIDE and w<SQUARE_ONE_SIDE:
        # do the stuff here
        mid_h = int(h/2)
        cropped_img = img[mid_h-int(SQUARE_ONE_SIDE/2):mid_h+int(SQUARE_ONE_SIDE/2), 0:w]
        # plt.imshow(cropped_img)
        # plt.show()
    elif h<SQUARE_ONE_SIDE and w>SQUARE_ONE_SIDE:
        # do the stuff here
        mid_w = int(w/2)
        cropped_img = img[0:h, mid_w-int(SQUARE_ONE_SIDE/2):mid_w+int(SQUARE_ONE_SIDE/2)]
        # plt.imshow(cropped_img)
        # plt.show()
    else:
        cropped_img = img #cv2.resize(img, (1000, 1000), interpolation = cv2.INTER_AREA)
        
     
    # print('Resized Dimensions : ',resized.shape)
    # cv2.imwrite(str(thumb_name+"_thumb."+exten),resized)
    cv2.imwrite(str(thumb_name+"_thumb."+exten),cropped_img)

#print(f)
for item in tqdm(f):
    if item.split('.')[1] not in "py" :
        print("file being processed => ",item)
        reshape_image(item)

# cv2.imshow("Resized image", resized)
# cv2.waitKey(0)
# cv2.destroyAllWindows() 
