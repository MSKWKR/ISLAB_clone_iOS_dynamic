import csv, json, sqlite3
from openpyxl import load_workbook
rule_file = 'stander.xlsx'

def submit(c:sqlite3.Cursor, platform, rule, mas, cve, owasp,MSTG):
    print(platform, rule, mas)
    c.execute(f'''
    INSERT INTO LAB (
        STATUS,
        PLATFORM,
        RULE,
        MAS,
        CVE,
        OWASP
    ) VALUES (
        'Active',
        '{platform}',
        '{rule}',
        '{mas}',
        '{cve}',
        '{owasp}'
        '{MSTG}'
    );
    ''')
with sqlite3.connect('stander.db') as conn:
    c = conn.cursor()
    c.execute('''
    CREATE TABLE IF NOT EXISTS LAB (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        STATUS TEXT NOT NULL,
        PLATFORM TEXT NOT NULL,
        RULE TEXT NOT NULL,
        MAS TEXT NOT NULL,
        CVE TEXT NOT NULL,
        OWASP TEXT NOT NULL,
        MSTG TEXT NOT NULL
    );
    ''')
    wb = load_workbook(rule_file)
    ws = wb.active
    for row in ws.rows:
        submit(c, 'Universal', row[-1].value[10:], row[-1].value[:9], '', '',row[-1].value[10:])
    conn.commit()
