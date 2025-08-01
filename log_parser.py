import json, enum, app_store, re, ssl, os
from urllib.parse import urlparse
from cryptography import x509
from cryptography.hazmat.backends import default_backend
from write_result import Analysis
#from main import Device
import frida
import FridaUtil
import datetime
import requests ,glob

analysis:Analysis = Analysis('output')
AnalysisNum:int = 32
results:list = []
temp_results:list= []
state_list:list = []
details:list = []
tmp_result:str = ""
content = '123456'
plist_content = {"username": "test", "password": "test"}
NSUserdefault_content = {"DemoValue = 'this is a test message'"}
Coredata_content = ''
lock = True
keychain_founded = {"genp":[{"Service":"com.highaltitudehacks.DVIAswiftv2.BDKYBV5AH6","Account":"keychainValue","Value":"iiiiiislaabb"}]}
TargetDoamin:str = 'https://expressionkey.com/'
VirusTotal_api = 'cc02737625d702d30504372b1480c138bdd5fc1276ba64c9fdb88ec9a46a9140'

for _ in range(AnalysisNum):
	results.append('')
	details.append('')
	state_list.append('False')



def content_filter(ADD_content:str, Basic_content:list):
	if ADD_content in Basic_content: #found the same content
		Basic_content = Basic_content
	else: #did not find the same content,add it to result
		Basic_content += ADD_content
	return Basic_content

def get_log(log_file:str)->list:
	records:list = []
	with open(log_file, 'r', encoding='utf-8') as record:
		records.extend(record.readlines())
	res:list = []
	for record in records:
		res.append(json.loads(record.strip()))
	return res

def parse_log(identifier:str):
	global results, state_list, details
	results = []
	state_list = []
	details = []
	print("Log parser initailize...")
	for _ in range(AnalysisNum+1):
		results.append('')
		details.append('')
		state_list.append('Skip')
	analysis.init(identifier)
	print("Opening log file")
	log_entries:list = get_log(f'./output/{identifier}.log')
	print("Starting to analyze log")
	for num, rule in analysis.getRules():
		#print(num, rule)
		#print(len(state_list))
		state_list[num] = 'Undetect'
		for entry in log_entries:
			rule(num, entry)
	#get_appstore_release_info(25, identifier)
	print("Finished analizing log")
	print("Starting to put the results into database")
	for i in range(AnalysisNum):
		# print(i, state_list[i])
		analysis.putResult(i, state_list[i], results[i], details[i])
	
	analysis.submit()
	print("Finished putting the results into database")
	
# ID: 1 SSL connection check
@analysis.register(1)
def ssl_connection_check(num:int, entry:dict):
	if entry['lib'] != 'NSURL' or entry['args'][0] == '':
		return
	if entry['args'][0].startswith('http://'):
		state_list[num] = 'Fail'
		results[num] += f"NSURL with HTTP {entry['args'][0]}\n"
	elif entry['args'][0].startswith('https://'):
		if state_list[num] != 'Fail':
			state_list[num] = 'Pass'
		results[num] += f"NSURL with HTTPs {entry['args'][0]}\n"
	else:
		if state_list[num] != 'Fail':
			state_list[num] = 'Pass'	# TODO: maybe can isolate into a new stander check
		results[num] += f"NSURL with Resources {entry['args'][0]}\n"

# ID: 6 Make use of SQLite deprecated functions 
sqlite3_deprecated:list = [
	'sqlite3_aggregate_count',
	'sqlite3_expired',
	'sqlite3_global_recover',
	'sqlite3_memory_alarm',
	'sqlite3_soft_heap_limit',
	'sqlite3_thread_cleanup',
	'sqlite3_transfer_bindings'
]
@analysis.register(6)
def make_use_of_sqlite_deprecated_func(num:int, entry:dict):
	if entry['lib'] != 'libsqlite3.dylib':
		return False
	if entry['function'] in sqlite3_deprecated:
		state_list[num] = 'Fail'
		results[num] += f"Deprecated function {entry['function']}\n"
		return True

# ID: 7 List all native method
def list_all_method(num:int, entry:dict):
	pass

# ID: 9 root or jailbreak detection
def root_jb_detect(num:int, entry:dict):
	pass

# ID: 8 Clipboard manipulation check
@analysis.register(8)
def clipboard_check(num:int, entry:dict):
	if entry['lib'] == "Foundation" and 'copy:' in entry['args'] or 'cut:' in entry['args']:
		state_list[num] = 'Manual'
		results[num] = "This application writes data to clipboard. Make sure it does this action with user's permission."
		details[num] = f'content: {content}'
		if entry['lib'] == 'UISecurePasteboard':
			state_list[num] = 'Skip'
			results[num] = ''


# ID: 9 Make use of SMS related code
@analysis.register(9)
def sms_sending(num:int, entry:dict):
	if entry['lib'] == 'MFMessageComposeViewController' and 'canSendText' in entry['func']:
		state_list[num] = 'Fail'
		results[num] = 'Make use of MFMessageComposeViewController';	# only need to record once


# ID: 10 Certificate check
@analysis.register(10)
def certificate_check(num:int, entry:dict):
	if entry['lib'] != 'NSURL':
		return False
	url = entry['args'][0]
	if str.startswith(url, "https://"):
		hostname = urlparse(url).hostname
		if urlparse(url).port == None:
			port = 443
		else:
			port = urlparse(url).port
		try:
			pem = ssl.get_server_certificate((hostname, port), ssl_version=ssl.PROTOCOL_TLS)
			cert = x509.load_pem_x509_certificate(pem.encode('utf-8'), default_backend())
			result:dict = {
				'url': url,
				'issuer': cert.issuer,
				'not valid after': str(cert.not_valid_after),
				'not valid before': str(cert.not_valid_before),
				'serial number': cert.serial_number,
				'signature algorithm': cert.signature_hash_algorithm.name,
				'subject': cert.subject,
				'x509 version': cert.version,
				'key size': cert.public_key().key_size
			}
			now = datetime.datetime.now()
			temp_results[num] += str({'valid': now < cert.not_valid_after - datetime.timedelta(days=14), 'detail': result})
			if all(item['valid'] for item in temp_results[num]):
				return False 
			else:
				results[num]="Certificate expired!"
				#return True

			# Check if all entries are true in results[num]
			# results[25] += f'{url} :\n'
			# results[25] += f'issuer : {cert.issuer}\n'
			# results[25] += f'not valid after : {cert.not_valid_after}\n'
			# results[25] += f'not valid before : {cert.not_valid_before}\n'
			# results[25] += f'serial number : {cert.serial_number}\n'
			# results[25] += f'signature algorithm : {cert.signature_hash_algorithm.name}\n'
			# results[25] += f'subject : {cert.subject}\n'
			# results[25] += f'x509 version : {cert.version}\n'
			# results[25] += f'key size : {cert.public_key().key_size}\n'
		except Exception as e:
			print(e)
			results[25] += f'SSL error with {url}\n'
		#state_list[num] = 'Manual'
		

# ID: 11 Base64 String decoding
@analysis.register(11)
def base64_decode_encode(num:int, entry:dict)->bool:
	if 'Base64' in entry['lib']:
		state_list[num] = 'Manual'
		results[num] += f"Base64 encoding with {entry['args']}"
	# url_regex:str = 'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
	# if entry['lib'] == 'NSURL':
	# 	if re.match(url_regex, entry['args'][0]):
	# 		print(f"Make use of Base64 encoding in url {entry['args'][0]}")
	# 	return True
	return False


# ID: 16 Make use of javascript in webview
@analysis.register(16)
def webview_enable_js(num:int, entry:dict)->bool:
	if entry['lib'] != 'UIWebView':
		return False
	if state_list[num] != 'Pass':
		state_list[num] = 'Pass' if entry['func'] != '- stringByEvaluatingJavaScriptFromString:' else 'Fail'
		results[num] = f"{'No u' if state_list[num] else 'U'}se UIWebView - stringByEvaluationgJavaScriptFromString in webview"
	
# ID: 13 Screenshot detection
@analysis.register(13)
def detect_screenshot(num:int, entry:dict) -> bool:
	if entry['lib'] != 'UIApplication':
		return False
	if state_list[num] != 'Pass':
		state_list[num] = 'Pass' if entry['func'] == '- _handleScreenshot' else 'Fail'
		results[num] = f"{'U' if state_list[num] else 'No u'}se UIApplication - _handleScreenshot to detect screenshot"

def allow_all_host(num:int, entry:dict):
	pass

def ats_http_enable(num:int, entry:dict):
	pass
def dynamic_code_loading(num:int, entry:dict):
	pass

class CCAlgorithm(enum.IntEnum):
	kCCAlgorithmAES128 = 0
	kCCAlgorithmAES = 0
	kCCAlgorithmDES = 1
	kCCAlgorithm3DES = 2    
	kCCAlgorithmCAST = 3   
	kCCAlgorithmRC4 = 4
	kCCAlgorithmRC2 = 5
	kCCAlgorithmBlowfish = 6

class CCCOptions(enum.IntEnum):
	kCCOptionPKCS7Padding   = 0x0001
	kCCOptionECBMode        = 0x0002
class keyLength(enum.IntEnum):
	kCCKeySizeAES128          = 16
	kCCKeySizeAES192          = 24
	kCCKeySizeAES256          = 32
	kCCKeySizeDES             = 8
	kCCKeySize3DES            = 24
	kCCKeySizeMinCAST         = 5
	kCCKeySizeMaxCAST         = 16
	kCCKeySizeMinRC4          = 1
	kCCKeySizeMaxRC4          = 512
	kCCKeySizeMinRC2          = 1
	kCCKeySizeMaxRC2          = 128
	kCCKeySizeMinBlowfish     = 8
	kCCKeySizeMaxBlowfish     = 56

class CCHmacAlgorithm(enum.IntEnum):
	kCCHmacAlgSHA1 = 0
	kCCHmacAlgMD5 = 0
	kCCHmacAlgSHA256 = 0
	kCCHmacAlgSHA384 = 0
	kCCHmacAlgSHA512 = 0
	kCCHmacAlgSHA224 = 0


# ID: 22 ENCRYPTION_MD5 Cipher&Degist Method found
@analysis.register(22)
def make_use_of_week_encryption_method(num:int, entry:dict):
	if entry['lib'] != 'libcommonCrypto.dylib':
		return False
	if 'CC_' in entry['func']:
		if entry['args'][0].startswith('MG'):
			return True
		state_list[num] = 'Manual'
		tmp_result = f"Use {entry['func']} with {entry['args']}\n"
		results[num] = content_filter(tmp_result,results[num])
		return True
	if 'CCHmac' in entry['func']:
		state_list[num] = 'Manual'
		tmp_result = f"Use Hmac_{entry['args'][0]} with key {entry['args'][1]} data {entry['args'][3]}\n"
		results[num] = content_filter(tmp_result,results[num])
		return True


# ID: 21 USE URL
@analysis.register(21)
def use_url_check(num:int, entry:dict):
	if entry['lib'] != 'Infoplist' and entry['func'] != 'CFBundleURLTypes':
		state_list[num] = 'Undetect'
		return False
	else:
		state_list[num] = 'Pass'
		tmp_result = f"Use URL schemes with {entry['args']}\n"
		results[num] = content_filter(tmp_result,results[num])
		return True
	

# ID: 20 Possible hard coded information
@analysis.register(20)
def possible_hardcoded_info(num:int, entry:dict):
	if entry['lib'] != 'libcommonCrypto.dylib' and 'CCCrypt' not in entry['func']:
		return False
	if entry['func'] == 'CCCrypt':
		if f"Use {CCAlgorithm(int(entry['args'][1])).name} with key {entry['args'][3]} and size {entry['args'][4]}" in results[20]:
			return True
		state_list[num] = 'Manual'
		results[num] += f"Use {CCAlgorithm(int(entry['args'][1])).name} with key {entry['args'][3]} and size {entry['args'][4]}\n"
	elif entry['func'] == 'CCCryptorCreate':
		return False

def third_party_lib_check(num:int, entry:dict):
	pass


# ID: 24 Make use of log function
@analysis.register(24)
def make_use_of_log_function(num:int, entry:dict):
	if entry['lib'] == 'Foundation' and 'NSLog' in entry['func']: # Possible value NSLog and NSLogv
		state_list[num] = 'Manual'
		tmp_result = f"Make use of log function {entry['func']} with {entry['args']}\n"
		results[num] = content_filter(tmp_result, results[num])

# ID: 25 Make use of autocorrecting keyboard
@analysis.register(25)
def AutoCorrecting_detected(num:int, entry:dict):
	if entry['lib'] == 'libSystem.B.dylib' and 'Caches' in entry['args'][0]:
		state_list[num] = 'Manual'
		results[num] = "Autocorrecting keyboard is detected, Please close the function by setting the UITextfield\n"

# ID: 26 Official store release
# @analysis.register(26)
def get_appstore_release_info(num:int, identifier:str):
	country:str = 'tw'
	res:dict = app_store.search(identifier, country)
	state_list[num] = 'Pass' if res['result'] else 'Fail'
	results[num] = json.dumps(res['data'], indent=4, ensure_ascii=False)

#ID: 23 Keychain dump
@analysis.register(23)
def LocalDataStorage(num:int, entry:dict):
	if entry['lib'] == 'libSystem.B.dylib' and 'PrivateFrameworks' in entry['args'][0]:
		state_list[num] = 'Manual'
		if "keychain" in entry['args'][0]:
			tmp_result = f'Detected storing keychain locally. Storing the keychain locally may not be a good approach.Please check your storing method'
			results[num] = content_filter(tmp_result, results[num])
			details[num] = f'keychain content:{keychain_founded}'
		elif "plist" in entry['args'][0]:
			tmp_result = f'Detected storing plist locally. Storing data in plist is unsafe.Please store your data to somewhere safe.'
			results[num] = content_filter(tmp_result, results[num])
			details[num] = f'plist content:{plist_content}'
		elif "NSUserdefaults" in entry['args'][0]:
			tmp_result = f'Detected storing NSUserdefaults locally. Storing data in NSUserdefaults is unsafe.Please store your data to somewhere safe.'
			results[num] = content_filter(tmp_result, results[num])
			details[num] = f'NSUserdefaults content:{NSUserdefault_content}'
		elif "coredata" in entry['args'][0]:
			tmp_result = f'Detected storing Coredata locally. Storing data in Coredata is unsafe.Please store your data to somewhere safe.'
			results[num] = content_filter(tmp_result, results[num])
			details[num] = f'Coredata content:{Coredata_content}'
		else:
			tmp_result = f'Detected storing Coredata locally. Storing data in Coredata is unsafe.Please store your data to somewhere safe.'
			results[num] = content_filter(tmp_result, results[num])
			# results[num] = f'Detected storing data locally. Storing data in local sandbox is unsafe.Please store your data to somewhere safe.'


#ID: 26 Domain Check
@analysis.register(26)
def domainCheck(num:int, entry:dict):
	if entry['lib'] == 'NSURL' and entry['args'][0].startswith('https://'):
		print(entry['args'][0])
		domain = urlparse(entry['args'][0]).hostname
		headers = {'x-apikey': VirusTotal_api}
		result = requests.get('https://www.virustotal.com/api/v3/domains/{}'.format(domain),headers=headers)
		maliciousUrl = result.json()['data']['attributes']['last_analysis_stats']['malicious']
		if(maliciousUrl != 0):
			state_list[num] = 'Manual'
			results[num] = 'Detected potential malicious links in the application.'
			details[num] = f'This application has been flagged as a malicious website URL by {maliciousUrl} antivirus software vendors on VirusTotal.Here is URL:https://expressionkey.com/\n'
	else:
		state_list[num] = 'Pass'


# ID: 27 Check if Position Independent Executable (PIE) is enabled
@analysis.register(27)
def check_pie_enabled(num:int, entry:dict):
    # Check if the 'clang' library is used in the entry
    if entry['lib'] == 'clang':
        # Check if the '-pie' flag is present in the arguments, indicating PIE is enabled
        if '-pie' in entry['args']:
            state_list[num] = 'Pass'
            results[num] = 'Position Independent Executable (PIE) is enabled.'
        else:
            state_list[num] = 'Fail'
            results[num] = 'Position Independent Executable (PIE) is not enabled.'


# ID: 28 Check if Debug mode is disabled
@analysis.register(28)
def check_debug_mode_disabled(num:int, entry:dict):
    # Check if the application is using functions or configurations specific to debug mode
    debug_indicators = ['NSDebugEnabled', 'NSZombieEnabled', 'NSAssert', 'NSLog']
    for indicator in debug_indicators:
        if indicator in entry['args']:
            state_list[num] = 'Fail'
            results[num] = 'Debug mode is enabled.'
            break
    else:
        state_list[num] = 'Pass'
        results[num] = 'Debug mode is disabled.'

# ID: 29 Detect if the inter-process communication (IPC) mechanisms in the application have leaked sensitive data.
@analysis.register(29)
def check_ipc_data_leakage(num:int, entry:dict):
    sensitive_data_patterns = ['password', 'username', 'credit_card', 'ssn','bank_account','medical_info','national_id']
    ipc_mechanisms = ['NSURL', 'UIPasteboard', 'NSUserActivity', 'CFNetwork']

    if entry['lib'] in ipc_mechanisms:
        for data_pattern in sensitive_data_patterns:
            if data_pattern in entry['args'][0]:  # 假設敏感資料出現在參數中
                state_list[num] = 'Fail'
                results[num] = f"Sensitive data leaked via {entry['lib']}."
                break
        else:
            state_list[num] = 'Pass'
            results[num] = "No sensitive data leakage detected in IPC mechanisms."

# ID: 30 Emulator Environment Detection and Response Validation
@analysis.register(30)
def emulator_environment_check(num: int, entry: dict):
#    print(f"Executing emulator_environment_check for ID={num}")

    emulator_indicators = [
        {'lib': 'Foundation', 'func': 'NSLog'},
        {'lib': 'Foundation', 'func': 'NSXPCConnection'},
        {'args': ['UIAlertController', 'UIApplication']}
    ]
    
    # Check if the log entry contains any indicator
    is_emulator = any(
        all(entry.get(key) == value for key, value in indicator.items())
        for indicator in emulator_indicators
    )
    if is_emulator:
        # Check alert or abort the execution
        if 'UIAlertController' in entry['args'] or 'UIApplication' in entry['args']:
            state_list[num] = 'Pass'
            results[num] = 'The emulator was detected and the application alerted the user or aborted execution.'
        else:
            state_list[num] = 'Fail'
            results[num] = 'The emulator was detected, but the application did not alert the user or terminate execution.'
    else:
        state_list[num] = 'Pass'
        results[num] = 'App is running on a physical device.'
    
#    print(f"Final state for ID=30: state={state_list[num]}, result={results[num]}")

# ID: 31 Password Length Validation Log and Alert Check
@analysis.register(31)
def password_length_check(num: int, entry: dict):
    error_keywords = ["password", "length", "too short", "no password"]
    
    if entry['lib'] == 'Foundation' and 'NSLog' in entry['func']:
        if any(keyword in entry['args'][0].lower() for keyword in error_keywords):
            if "UIAlertController" in entry['args'][0]:
                state_list[num] = 'Pass'
                results[num] = 'Password validation failed, and a warning alert was triggered.'
            else:
                state_list[num] = 'Fail'
                results[num] = 'Password validation failed, but no warning alert was triggered.'
    else:
        state_list[num] = 'Pass'
        results[num] = 'Password validation log does not indicate any failures.'
        
#    print(f"Final state for ID=30: state={state_list[num]}, result={results[num]}")



# checklist:list = [
# 	(1, ssl_connection_check),
# 	(6, make_use_of_sqlite_deprecated_func),
# 	(0, list_all_method),	# 7
# 	(0, root_jb_detect),	# 9
# 	(10, sms_sending),
# 	(11, certificate_check),
# 	(15, base64_decode_encode),
# 	(16, webview_enable_js),
# 	(20, detect_screenshot),
# 	(0, allow_all_host),
# 	(0, ats_http_enable),
# 	(0, dynamic_code_loading),
# 	(34, make_use_of_week_encryption_method),
# 	(43, possible_hardcoded_info),
# 	(0, third_party_lib_check),
# 	(50, make_use_of_log_function),
#	(48, dylib_file_exist)
# ]

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
    
    parse_log(reverse_menu[int(identifier_number)])

