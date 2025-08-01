import csv, json

stander_file = './stander.csv'
stander: dict = {}
stander_list:list = []
flag = False;
with open(stander_file, newline='', encoding='utf-8') as csvfile:
    rows = csv.reader(csvfile)
    for row in rows:
        if flag == False:
            flag = True
            continue
        rule:dict = {}
        stander:dict = {}
        operation:dict = {}
        rule['ID'] = row[1]
        rule['Platform'] = row[2]
        rule['Test name'] = row[3]
        stander['OWASP'] = row[4]
        stander['CVE'] = row[5]
        stander['工業局編號'] = row[6]
        stander['工業局APP資安檢測項目'] = row[7]
        stander['工業局APP資安技術要求'] = row[8]
        stander['工業局分類'] = row[9]
        stander['MAST編號'] = row[10]
        stander['MAST規範'] = row[11]
        stander['OWASP (2017 checklist)'] = row[12]
        stander['Lab'] = row[13]
        stander['Bank'] = row[14]
        stander['MSTG'] = row[15]
        stander['Level'] = row[16]
        stander['Desc'] = row[17]
        rule['對應規範'] = stander
        rule['Result'] = ''
        rule['Detail'] = ''
        stander_list.append(rule)

# print(stander_list)
with open('stander.json', 'w', encoding='utf-8') as file:
    json_file = json.dumps(stander_list, indent = 4, ensure_ascii=False)
    file.write(json_file)
