import requests, json

header:dict = {
        'User-Agent': ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) '
                       'AppleWebKit/537.36 (KHTML, like Gecko) '
                       'Chrome/39.0.2171.95 Safari/537.36')}

def is_avalible_in_store(identifier:str, country:str='tw') -> bool:
    url:str = f'https://itunes.apple.com/lookup?bundleId={identifier}&country={country}'
    req = requests.get(url, headers=header)
    response = req.json()
    result:dict = {}
    return response['resultCount'] != 0
def search(identifier:str, country:str='tw') -> dict:
    url:str = f'https://itunes.apple.com/lookup?bundleId={identifier}&country={country}'
    response:dict = {}
    try:
        req = requests.get(url, headers=header)
        response = req.json()
    except:
        response['resultCount'] = 0

    result:dict = {}
    data:dict = {}
    result['result'] =  True if response['resultCount'] else False
    if response['resultCount']:
        data = response['results']
    result['data'] = response['results'] if response['resultCount'] else data
    return result
    

if __name__ == '__main__':
    print(search('tw.com.tbb.mb', 'tw'));