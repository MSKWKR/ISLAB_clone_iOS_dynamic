#!/usr/bin/python3
from genericpath import exists
from turtle import end_fill
from unittest import result
from flask import Flask, jsonify, render_template
from flask_cors import CORS
from flask import send_file
import frida, json, frida, base64
from io import StringIO
from PIL import Image
from tempfile import NamedTemporaryFile
import csv, os, sqlite3,hashlib, requests, glob
import re, jinja2, datetime, time


#生成時間戳
def timest():
    nowTime = int(time.time()) # 取得現在時間
    struct_time = time.localtime(nowTime) # 轉換成時間元組
    timeString = time.strftime("%a, %d %b %Y %H:%M:%S GMT", struct_time) # 將時間元組轉換成想要的字串
    return timeString

#從資料庫中提取檢測結果
class DBInteract:
    #建立資料庫初始資訊，名稱、路徑等等，並連接資料庫
    def __init__(self, identifier, path:str='.'):
        self.table = identifier.replace('.', '').replace('-', '')
        self.identifier = identifier
        self.output_path = path
        self.conn = sqlite3.connect(f'{self.output_path}/{identifier}.db')
        self.cursor = self.conn.cursor()
        #若資料庫不存在則建立新的
        self.cursor.execute(f'''
        CREATE TABLE IF NOT EXISTS {self.table} (
            ID INTEGER PRIMARY KEY,
            RESULT TEXT NOT NULL,
            DESCRIPTION TEXT NOT NULL
        );
        ''')
        #與資料庫互動，提取資料
    def query(self):
        self.cursor.execute(f'''
        SELECT * FROM {self.table}
        ''')
        results = self.cursor.fetchall()
        return results
        #關閉與資料庫的連接
    def close(self):
        self.conn.commit()
        self.conn.close()
#從資料庫中取得檢測規則
class Rule:
    #建立初始資訊，並連接資料庫
    def __init__(self, path:str='.'):
        self.output_path = path
        self.conn = sqlite3.connect(f'{self.output_path}/stander.db')
        self.cursor = self.conn.cursor()
    #從資料庫獲取資料
    def query(self):
        self.cursor.execute(f'''
        SELECT * FROM LAB
        ''')
        results = self.cursor.fetchall()
        return results
    #關閉與資料庫的連結
    def close(self):
        self.conn.commit()
        self.conn.close()

def results(identifier):
    
    #修改檢測敘述以符合報表格式
    def change_bool(words):
        if words == "Undetect" or words == "Skip" or words == "Pass":
            return False
        else:
            return True
    
    rule_file = './rules/stander.csv'
    rule_list:list = []
    handler = DBInteract(identifier, 'output')
    rules= Rule('rules')
    #檢測結果
    print("Retrieve the analysis results from the database.")
    #if 
    app_list:dict = {
        'lab_' + str(row[0]):{
            'isDetected': change_bool(row[1]),
            'data':[{"details":row[2],"description":row[3]}],'type':[]} for row in handler.query()}
    '''
    #在AppStore的商店描述中找資料放
    def find_str(words):    
        target = app_list['lab_25']['data'][0]['description'].find(words)
        firstquote = app_list['lab_25']['data'][0]['description'].find(':' , target+len(words),target+len(words)+5)
        nextcomma = app_list['lab_25']['data'][0]['description'].find(',' , target,target+30)
        target_str = app_list['lab_25']['data'][0]['description'][firstquote+3:nextcomma-1] 
        return target_str
    '''
    def find_str(words):    
        target = ''
        firstquote = ''
        nextcomma = ''
        target_str = ''
        return target_str
    
    #處理md5,sha256
    m = hashlib.md5()
    sha = hashlib.sha256()
    data = find_str("trackName")
    m.update(data.encode("utf-8"))
    sha.update(data.encode("utf-8"))
    h = m.hexdigest()
    sha_h = sha.hexdigest()
    
    #將standard中的檢測規則儲存到rule_list中
    with open(rule_file, newline='', encoding='utf-8') as csvfile:
        rows = csv.reader(csvfile)
        for row in rows:
            rule:dict = {}
            rule['ID'] = row[1]
            rule['Platform'] = row[2]
            rule['Test name'] = row[3]
            rule['OWASP'] = row[4]
            rule['CVE'] = row[5]
            rule['工業局編號'] = row[6]
            rule['工業局APP資安檢測項目'] = row[7]
            rule['工業局APP資安技術要求'] = row[8]
            rule['工業局分類'] = row[9]
            rule['MSTG'] = row[15]
            rule['Level'] = row[16]
            rule['Desc'] = row[17]
            rule_list.append(rule)
    #檢測規則
    print("Generating rulelist in json")
    rule_list_for_json = {
        'lab_' + row['ID']:{ 
            'title':row['Test name'],
            'mas': row['工業局編號'],
            'mast': row['工業局分類'],
            'real_mstg':row["MSTG"] ,
            'platform': row["Platform"],
            'owasp_mobile': row["OWASP"],
            'level':row['Level'],
            'cve': row["CVE"],
            'desc':row['Desc']} for row in rule_list
        }
    

    """
    for i in range(0,51):
        if 'lab_' + str(i+1) in rule_list_for_json:
            rule_list_for_json['lab_' + str(i+1)]['real_mstg'] = rule_list[i+1]['MSTG']
            rule_list_for_json['lab_' + str(i+1)]['title'] = rule_list[i+1]['Test name']
            rule_list_for_json['lab_' + str(i+1)]['mas'] = rule_list[i+1]['工業局編號']
            rule_list_for_json['lab_' + str(i+1)]['platform'] = rule_list[i+1]['Platform']
            rule_list_for_json['lab_' + str(i+1)]['owasp'] = rule_list[i+1]['OWASP']
            rule_list_for_json['lab_' + str(i+1)]['cve'] = rule_list[i+1]['CVE']
        else:
            continue
    """
    
    #報表用json格式
    print("Generating basic information and analysis results in json")
    output_json = {
        'md5': h,
        'sha256': sha_h,
        'timestamp':timest(),
        'app_name':find_str("trackName"),
        'app_version':find_str("version"),
        'average_cvss':0,
        'build':"",
        'bundle_id':identifier,
        'file_name':find_str("trackName"),
        'mast_report':app_list,
        'min_os_version':find_str("minimumOsVersion"),
        'sdk_name':"iphoneos13.3.1",
        'url_list':""
    }
    
    #del app_list['lab_25']
    #output_json['mast_report'] = app_list

    #將兩個json合併
    print("merging json files...")
    merged = {
        'system':'ios',
        'lang': 'zh-tw',
        'rule':rule_list_for_json,
        'result':output_json
    }

    #輸出json檔
    with open(f"result_json/{identifier}.json","w") as f:
        json.dump(merged, f , indent=4)   

    headers = {
    "Content-Type": "application/json"
    }

    print("Sending request to report system")
    #送出requests給報表api
    response = requests.post("http://192.168.50.148:15148/api/report",data=json.dumps(merged) ,headers=headers)
    if response.status_code == 200:
        print('200 OK. Report generated successfully. Please proceed to view it.')
    elif response.status_code == 301:
        print('301 Move Permanently. The requested page has been permanently moved to a new location. Please contact the administrator.')
    elif response.status_code == 404:
        print('404 NotFound. The server cannot find the requested page.Please make sure that the link you are using is correct.')
    elif response.status_code == 403:
        print('403 Forbidden. The server has successfully received the request, but encountered certificate or permission issues.You need VPN or contact the administrator to solve this problem')
    elif response.status_code == 500:
        print('500 Internal Server Error.The server encountered an error that prevented it from completing the requested operation. The most common scenario is the detection of result character limit. Please check if the data format restrictions are correct.')
    else:
        print(f'Encountering an uncommon error, here is the status code{response.status_code}')

    #將收到的資料寫成pdf
    with open(f'result_pdf/{identifier}_results.pdf','wb') as fd:
        for chunk in response.iter_content(2000):
            fd.write(chunk)
    



if __name__ == '__main__':

    folder_path = 'output/'
    files = sorted(glob.glob(os.path.join(folder_path, '*')))
    menu:dict = {}
    menu_num = 0

    # 按順序打開文件並讀取文件檔名
    print("Loading files...")
    for file in files:
        with open(file, 'r') as f:
            content = os.path.splitext(f.name)[0]
            content = content.replace(folder_path, "")
            if content in menu:
                continue
            else:
                menu[content] = menu_num
                print(f"{menu_num}: {content}")
                menu_num += 1
                
    reverse_menu = {v: k for k,v in menu.items()}
     
    identifier_number = input("input menu number: ")
    results(reverse_menu[int(identifier_number)])


