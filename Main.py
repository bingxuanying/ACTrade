import numpy as np
import xlrd as xlrd
import json
import pandas as pd
import mock
import codecs
# 导入需要的模块
from bs4 import BeautifulSoup
import urllib.request
from urllib.parse import quote
import re
import random

# 记录未收录的
not_found_items = []
# 从bilibili-wiki爬取图片
def getImgUrl(name):
    name_encode = quote(name, 'utf-8')
    url_page = 'https://wiki.biligame.com/dongsen/' + name_encode
    # 获取网页内容，把 HTML 数据保存在 page 变量中
    try:
        page = urllib.request.urlopen(url_page)
        # 用 Beautiful Soup 解析 html 数据，
        # 并保存在 soup 变量里
        soup = BeautifulSoup(page, 'html.parser')
        table = soup.find('table', attrs={'class': 'wikitable'})
        results = table.find_all('img')
        if len(results) > 0:
            rs = str(results[0])
            _url = re.findall(r'src=(.{100})', rs)[0]
            url = re.findall(r'\"(.*?)\"', _url)[0]
            return str(url)
        else:
            print(name + '无法抓取图片')
            return ""
    except:
        print(name + "404")
        not_found_items.append(name)
        return ""
# 从bilibili-wiki爬取配方
def getMaterial(name):
    nameEncode = quote(name, 'utf-8')
    urlpage = 'https://wiki.biligame.com/dongsen/' + nameEncode
    # 获取网页内容，把 HTML 数据保存在 page 变量中
    try:
        page = urllib.request.urlopen(urlpage)
        # 用 Beautiful Soup 解析 html 数据，
        # 并保存在 soup 变量里
        soup = BeautifulSoup(page, 'html.parser')
        table = soup.find('table', attrs={'class': 'wikitable'})
        materials = {}
        mtable = table.find_all('tr')
        # 6 ~ 11为材料项
        for i in range(6, 12):
            x = str(mtable[i]).replace('\n', '').replace('\r', '')
            # print(x)

            # get title
            _title = re.findall(r'title=(.{10})', x)[0]
            title_arr = re.findall(r'\"(.*?)\"', _title)
            if title_arr:
                title = title_arr[0]
                print(title)

            _number = re.findall(r'</td><td>(.*?)</td></tr>', x)
            if _number:
                number = _number[0]
                print(number)
            if title and number:
                materials[title] = int(number)

        return (materials)
    except:
        print(name + "爬不到合成表")
        return None
#获取diy与配方
def getType(name):
    nameEncode = quote(name, 'utf-8')
    urlpage = 'https://wiki.biligame.com/dongsen/' + nameEncode
    # 获取网页内容，把 HTML 数据保存在 page 变量中
    try:
        page = urllib.request.urlopen(urlpage)
        # 用 Beautiful Soup 解析 html 数据，
        # 并保存在 soup 变量里
        soup = BeautifulSoup(page, 'html.parser')
        table = soup.find('table', attrs={'class': 'wikitable'})
        materials = {}
        mtable = table.find_all('tr')
        __type = str(mtable).replace('\n', '').replace('\r', '')
        _type = re.findall(r'物件种类(.{30})', __type)[0]
        type = re.findall(r'<td>(.*?)</', _type)[0]
        if type == '':
            print("no type")
            return None
        else:
            print("成功获取type")
            return (type)
    except:
        print(name + "爬不到种类")
        return None
def getDiy(df1,df2):
    # 创建一个name -> 配方 的字典
    diy_name = df1['DIY手册配方']
    diy_materials = {}
    for index, name in enumerate(diy_name):
        # me为一个key对应的所需材料
        me = {}
        # 读取每一种材料
        for col_idx in range(2, 8):
            x = df1.iat[index, col_idx]
            if not x:
                break
            else:
                # 分开string为材料和数量
                # material_arr = str(x).split('x',1)
                material_arr = re.split('[×xX*]', x)
                if len(material_arr) >= 2:
                    me[material_arr[0]] = int(material_arr[1])
                else:
                    print(name + "的配方有问题，在" + x)
                    print(material_arr)
                    continue
        diy_materials[name] = me
    # print(diy_materials)
    diy = {}
    for cat in df2.head():
        # print(cat) #读取系列
        arr = df2[cat] # arr 为array，里为cat列的items
        for index, name in enumerate(arr):
            if not name: #跳过空值
                continue
            print(str(cat) + " "+ str(index) + ' ' + str(name))
            info = {}
            info["collection"] = "DIY"
            info["zh_name"] = name
            info["系列"] = cat
            info["img_url"] = getImgUrl(name)
            # 读取meterials:
            if name in diy_materials.keys():
                info["recipe"] = diy_materials[name]
            else:
                info["recipe"] = getMaterial(name)
            info["种类"] = getType(name)
            # add into into diy
            diy[cat+str(index)] = info
    print(diy.__len__())
    return diy
#获取可购买家具图鉴
def getFurnitureInfoMapping():
    name = "家具图鉴"
    nameEncode = quote(name, 'utf-8')
    urlpage = 'https://wiki.biligame.com/dongsen/' + nameEncode

    furnitureImgUrl = {}
    page = urllib.request.urlopen(urlpage)
    # 用 Beautiful Soup 解析 html 数据，
    # 并保存在 soup 变量里
    soup = BeautifulSoup(page, 'html.parser')
    table = soup.find('table',attrs={'class':"CardSelect wikitable sortable poke-zt"})
    results = table.find_all('tr')
    for item in results[1:]:

        repo = item.find_all('td')
        # repo[0] is IMg, repo[2] is Name
        _name = str(repo[2]).replace('\n', '').replace('\r', '')
        fname = re.findall(r'<td>(.+?)</td>',_name)[0]
        _type = str(repo[7]).replace('\n', '').replace('\r', '')
        type = re.findall(r'<td>(.+?)</td>', _type)[0]
        if fname not in furnitureImgUrl:
            _img = str(repo[0].find_all('img')[0])
            _url = re.findall(r'src=(.{150})', _img)[0]
            url = re.findall(r'\"(.*?)\"', _url)[0]
            info = {}
            info["url"] = url
            info["type"] = type
            furnitureImgUrl[fname] = info
    return (furnitureImgUrl)

def getFurniture(df3):
    furniture = {}
    furnitureImgUrl = getFurnitureInfoMapping()

    for index ,name in enumerate(df3["家具"]):
        print(str(index) + " "+ name)
        info = {}
        info["collection"] = "家具"
        info["zh_name"] = name
        if name in furnitureImgUrl:
            info["img_url"] = furnitureImgUrl[name]["url"]
            info["种类"] = furnitureImgUrl[name]["type"]
        else:
            print("没找到"+name+"的imgurl")
        info["recipe"] = {"玲钱": df3["价格"][index]}
        color = []
        for i in range(2,9):
            if not df3.iat[index, i]:
                continue
            # print(df3.iat[index, i])
            color.append (df3.iat[index, i])
        info["颜色"] = color
        furniture[name] = info

    # print(furniture)
    return furniture

def getVillagers():
    name = "小动物图鉴"
    nameEncode = quote(name, 'utf-8')
    urlpage = 'https://wiki.biligame.com/dongsen/' + nameEncode
    villagers = {}
    page = urllib.request.urlopen(urlpage)
    # 用 Beautiful Soup 解析 html 数据，
    # 并保存在 soup 变量里
    soup = BeautifulSoup(page, 'html.parser')
    table = soup.find('table',attrs={'id':"CardSelectTr"})
    results = table.find_all('tr')
    for item in results[1:]:
        villager = {}
        villager["subscription"] = random.randint(0,20)
        villager["recipe"] = {}
        villager["collection"]="小动物"
        repo = item.find_all('td')
        # repo[0]:img&name, repo[1]:gender, repo[2]:character, repo[3]:种族, repo[4]:brithday, repo[5]:口头禅
        # Name
        __name = str(repo[0]).replace('\n', '').replace('\r', '')
        _name =  re.findall(r'title=\"([^a-zA-Z]+?)\"', __name)
        if len(_name) >= 1:
            name = _name[0]
            villager["zh_name"] = name
        else:
            print("获取名字失败")
            print(_name)
            continue
        # IMG
        _img = re.findall(r'src=\"(.+?)\"', __name)
        if len(_img) >= 1:
            img = _img[0]
            villager["img_url"] = img
        else:
            print("获取url失败")
        # Gender
        _gender = str(repo[1]).replace('\n', '').replace('\r', '')
        gender = re.findall(r'>(.+?)<', _gender)[0]
        if gender == '♀':
            gender = "女生"
        else:
            gender = "男生"
        villager["性别"] = gender
        villager["recipe"]["性别"] = gender
        # character
        _character = str(repo[2]).replace('\n', '').replace('\r', '')
        character = re.findall(r'>(.+?)<', _character)[0]
        character_head = re.split('[a-zA-Z、]', character)[0]
        villager["性格"] = character_head
        villager["recipe"]["性格"] = character_head
        # race
        _race = str(repo[3]).replace('\n', '').replace('\r', '')
        race = re.findall(r'>(.+?)<', _race)[0]
        villager["种族"] = race
        villager["recipe"]["种族"] = race
        # birthday
        _birthday = str(repo[4]).replace('\n', '').replace('\r', '')
        birthday = re.findall(r'>(.+?)<', _birthday)[0]
        birthmonth = re.findall(r'\d+',birthday)[0]
        villager["birthday"] = birthday
        villager["recipe"]["生日"] = birthday
        villager["生日"] = str(birthmonth) + "月"
        # word
        __word = str(repo[5]).replace('\n', '').replace('\r', '')
        _word = re.findall(r'>(.+?)<', __word)
        if len(_word) >= 1:
            villager["口头禅"] = _word[0]
            villager["recipe"]["口头禅"] =_word[0]
            print(_word[0])
        else:
            print("没有口头禅")
            villager["口头禅"] = "无口头禅~"
            villager["recipe"]["口头禅"] = "无口头禅~"
        villagers[name] = villager
    return(villagers)

def modifyJson():
    # 用来给导出的subscripiton赋值的
    file = open('materials.json', 'r', encoding='UTF-8')
    jsonData = json.load(file)
    newJson = {}
    for item in jsonData:
        print(item)
        newJson[item["zh_name"]]= item["img_url"]
    print(len(jsonData))
    print(newJson)
    # print(objs)
    # 写入json
    #
    fp = codecs.open('materials2.json', 'w', 'utf-8')
    fp.write(json.dumps(newJson, ensure_ascii=False))
    fp.close()

def getArt():
    name = "艺术品鉴伪"
    nameEncode = quote(name, 'utf-8')
    urlpage = 'https://wiki.biligame.com/dongsen/' + nameEncode
    page = urllib.request.urlopen(urlpage)
    # 用 Beautiful Soup 解析 html 数据，
    # 并保存在 soup 变量里
    soup = BeautifulSoup(page, 'html.parser')
    table = soup.find('table',attrs={'class':"wikitable"})
    results = table.find_all('tr')
    arts = {}
    for item in results[1:-1]:
        art = {}
        art["subscription"] = random.randint(0,20)
        art["recipe"] = {}
        art["collection"]="艺术品"
        repo = item.find_all('td')
        # repo[0]为名字，repo[1]为真图,repo[2][3]为赝品，repo[4]为区别说明
        __name = str(repo[0].find_all('p')).replace('\n', '').replace('\r', '')
        _name = re.findall(r'\>([^a-zA-Z]+?)\<', __name)
        name = _name[-1]
        art["zh_name"] = "真 "+ name
        print(name)
        __img = str(repo[1].find_all('img')).replace('\n', '').replace('\r', '')
        _img = re.findall(r'src=\"(.+?)\"', __img)
        art["img_url"] = _img[0]
        art["真假"] = "真品"
        arts[art["zh_name"]] = art
        #这里 添加赝品
        __img1 = str(repo[2].find_all('img')).replace('\n', '').replace('\r', '')
        _img1 = re.findall(r'src=\"(.+?)\"',__img1)
        __img2 = str(repo[3].find_all('img')).replace('\n', '').replace('\r', '')
        _img2 = re.findall(r'src=\"(.+?)\"',__img2)
        if len(_img1) > 0:
            art1 = art.copy()
            art1["zh_name"] = "假 " + name
            art1["img_url"] = _img1[0]
            art1["真假"] = "赝品"
            arts[art1["zh_name"]] = art1
        if len(_img2) > 0:
            art2 = art.copy()
            art2["zh_name"] = "假 " + name + "2"
            art2["img_url"] = _img2[0]
            art2["真假"] = "赝品"
            arts[art2["zh_name"]] = art2
    return arts

def getSongs():
    name = "唱片图鉴"
    nameEncode = quote(name, 'utf-8')
    urlpage = 'https://wiki.biligame.com/dongsen/' + nameEncode
    page = urllib.request.urlopen(urlpage)
    # 用 Beautiful Soup 解析 html 数据，
    # 并保存在 soup 变量里
    soup = BeautifulSoup(page, 'html.parser')
    table = soup.find('table',attrs={'class':"wikitable"})
    results = table.find_all('tr')
    cnt = 0
    Songs = {}
    for item in results:
        repo = item.find_all('td')
        # print(repo)
        if len(repo) <= 0:
            continue
        cnt += 1
        Song = {}
        Song["subscription"] = random.randint(0,20)
        Song["collection"]= "唱片"
        #repo[1]为名字，repo4为imgurl repo6为买入价
        __name = str(repo[1]).replace('\n', '').replace('\r', '')
        _name = re.findall(r'\>([^<>]+?)\<', __name)
        name = _name[0]
        Song["zh_name"] = name
        # print(name)
        __imgurl = str(repo[4]).replace('\n', '').replace('\r', '')
        _imgurl = re.findall(r'src=\"(.+?)\"', __imgurl)
        Song["img_url"] = _imgurl[0]
        # print(_imgurl[0])
        __price = str(repo[6]).replace('\n', '').replace('\r', '')
        _price = re.findall(r'<td>(.+?)</td>', __price)
        price = _price[0]
        if price != '3200':
            Song["recipe"] = {"非卖品": price}
        else:
            Song["recipe"] = {"玲钱": price}
        Songs[name] = Song
    print(cnt)
    return Songs

def getCloth(type):
    nameEncode = quote(type, 'utf-8')
    urlpage = 'https://wiki.biligame.com/dongsen/' + nameEncode
    page = urllib.request.urlopen(urlpage)
    # 用 Beautiful Soup 解析 html 数据，
    # 并保存在 soup 变量里
    soup = BeautifulSoup(page, 'html.parser')
    table = soup.find('table',attrs={'id':"CardSelectTr"})
    results = table.find_all('tr')
    clothes = {}
    for item in results:
        repo = item.find_all('td')
        if len(repo) <= 0:
            continue
        cloth = {}
        cloth["collection"] = "服装"
        cloth["subscription"] = random.randint(0,20)
        #repo[0]是 img + name repo1是类型，repo2是颜色 repo3是价格
        ___name = repo[0].find_all('a')
        __name = str(___name[-1]).replace('\n', '').replace('\r', '')
        _name = re.findall(r'>(.+?)</a>', __name)
        name = _name[0]
        if name in clothes:
            print("遇到重复")
            continue
        print(name)
        cloth["zh_name"] = name
        __imgurl = str(repo[0]).replace('\n', '').replace('\r', '')
        _imgurl = re.findall(r'src="(.+?)"', __imgurl)
        cloth["img_url"] = _imgurl[0]

        __price = str(repo[3]).replace('\n', '').replace('\r', '')
        _price = re.findall(r'<td>(.+?)</td>', __price)
        cloth["recipe"] = {"玲钱": _price[0]}

        __type = str(repo[1]).replace('\n', '').replace('\r', '')
        _type = re.findall(r'<td>(.+?)</td>', __type)
        cloth["种类"] = _type[0]

        clothes[name] = cloth
    print(len(clothes))
    return clothes

def getClothes():
    clothes = {}
    for x in ["服饰图鉴","下装","连衣裙","帽子","头盔","饰品","袜子","鞋","包"]:
        clothes.update(getCloth(x))
    return clothes

def getFossiles():
    nameEncode = quote("化石图鉴", 'utf-8')
    urlpage = 'https://wiki.biligame.com/dongsen/' + nameEncode
    page = urllib.request.urlopen(urlpage)
    # 用 Beautiful Soup 解析 html 数据，
    # 并保存在 soup 变量里
    soup = BeautifulSoup(page, 'html.parser')
    table = soup.find('table',attrs={'id':"CardSelectTr"})
    results = table.find_all('tr')
    fossiles ={}
    for item in results[1:]:
        repo = item.find_all('td')
        if len(repo) <= 0:
            continue
        fossile = {}
        fossile["collection"] = "化石"
        fossile["subscription"] = random.randint(0,20)
        fossile["bg_color"] = "#fffbb5"
        #repo[0]是图片+名字，repo[3]是出售价格
        __name = str(repo[0]).replace('\n', '').replace('\r', '')
        _name = re.findall(r'title=\"([^.]+?)\"',__name)
        name = _name[0]
        if name == "化石":
            continue
        fossile["zh_name"] = name
        _imgurl = re.findall(r'src=\"(.+?)\"', __name)
        imgurl = _imgurl[0]
        fossile["img_url"] = imgurl
        fossiles[name] = fossile
    return fossiles

# 程序从这里开始
df1 = pd.DataFrame(pd.read_excel('acDiy.xlsx', sheet_name="diy材料"))
df1 = df1.fillna(value=False)
df2 = pd.DataFrame(pd.read_excel('acDiy.xlsx', sheet_name="diy全图鉴"))
df2 = df2.fillna(value=False)
df3 = pd.DataFrame(pd.read_excel('acDiy.xlsx', sheet_name="可购买家具图鉴"))
df3 = df3.fillna(value=False)

# diy = getDiy(df1,df2)
# furniture = getFurniture(df3)
# extraDiy =getDiy(df1,df2)
# villagers = getVillagers()
# arts = getArt()
# songs = getSongs()
# clothes = getClothes()
fossiles = getFossiles()

# 写入json
fp = codecs.open('fossiles.json', 'w', 'utf-8')
fp.write(json.dumps(fossiles, ensure_ascii=False))
fp.close()
# jsonStr = json.dumps(diy, ensure_ascii=False)
# print(jsonStr)