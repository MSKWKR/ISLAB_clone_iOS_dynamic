import json

objc:list = []
swift:list = []
with open('rules/rules.json', 'r', encoding='utf-8') as file:
	rules:list = json.load(file)
	for checklist in rules:
		if 'methods' not in checklist:
			continue
		methods:list = checklist['methods']
		for method in methods:
			if 'module_name' in method:
				if 'methods' in method:
					for m in method['methods']:
						tmp:dict = {}
						tmp['module_name'] = method['module_name']
						tmp['method'] = m
						swift.append(tmp)
				else:
					swift.append(method)
			elif 'class_name' in method:
				if 'methods' in method:
					for m in method['methods']:
						tmp:dict = {}
						tmp['class_name'] = method['class_name']
						tmp['method'] = m
						objc.append(tmp)
				else:
					objc.append(method)
			else:
				print('not a valid rule')
def get_objc_rules()->list:
	return objc

def get_swift_rules()->list:
	return swift
