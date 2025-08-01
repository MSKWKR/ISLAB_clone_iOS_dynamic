import csv, json, sqlite3, pandas, os


class Analysis():
    def __init__(self, path:str='.'):
        self.registered_rule:list = []
        self.output_path = path
        self.header:dict = {
			'ID': 'ID',
			'Result': 'Result',
			'Detail': 'Detail'
		}
        # self.conn = sqlite3.connect(f'{self.output_path}/{identifier}.db')
        # self.cursor = self.conn.cursor()
        # self.cursor.execute(f'''
        # CREATE TABLE IF NOT EXISTS {self.table} (
        #     ID INTEGER PRIMARY KEY,
        #     RESULT TEXT NOT NULL,
        #     DESCRIPTION TEXT NOT NULL
        # );
        # ''')
    
    def init(self, identifier):
        self.table = identifier.replace('.', '').replace('-', '')
        self.identifier = identifier
        if os.path.exists(f'{self.output_path}/{identifier}.db'):
            os.remove(f'{self.output_path}/{identifier}.db')
        
        self.conn = sqlite3.connect(f'{self.output_path}/{identifier}.db')
        self.cursor = self.conn.cursor()
        self.cursor.execute(f'''
        CREATE TABLE IF NOT EXISTS {self.table} (
            ID INTEGER PRIMARY KEY,
            RESULT TEXT NOT NULL,
            DESCRIPTION TEXT NOT NULL,
            DETAILS TEXT NOT NULL
        );
        ''')
    
    def register(self, num):
        def decorator(func):
            self.registered_rule.append((num, func))
            # print(self.registered_rule)
            return func
        return decorator

    def getRules(self)->list:
        return self.registered_rule

    def putResult(self, num:int, result:str='Skip', description:str='', details:str=''):
        desc:str = description.replace("'", "\"")
        dtls:str = details.replace("'","\"")
        self.cursor.execute(f'''
        INSERT OR IGNORE INTO {self.table} (
            ID,
            RESULT,
            DESCRIPTION,
            DETAILS
        ) VALUES (
            {num},
            '{result}',
            '{desc}',
            '{dtls}'
        );
        ''')

    def submit(self):
        def dump_to_csv():
            self.cursor.execute(f'''
            SELECT * FROM {self.table}
            ''')
            results:list = self.cursor.fetchall()
            csv_data:list = [{'ID': result[0], 'Result':result[1], 'Detail':result[2]} for result in results]
            with open(f'./output/{self.identifier}.csv', 'w', encoding='utf-8') as file:
                tmp = csv.DictWriter(file, self.header)
                tmp.writerows(csv_data)
            csv_file = pandas.read_csv(f'./output/{self.identifier}.csv', encoding='utf-8')
            csv_file.to_excel(f'./output/{self.identifier}.xlsx', sheet_name='result')
        self.conn.commit()
        dump_to_csv()
        self.conn.close()
