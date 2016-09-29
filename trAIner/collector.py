import urllib2
import json

api_key = '2243b328-6fc3-4c74-b0d1-4d5dd575182e'
euw_api = 'https://euw.api.pvp.net/api/lol/euw/v1.4/'
#https://euw.api.pvp.net/api/lol/euw/v1.4/summoner/by-name/Yrthgze?api_key=2243b328-6fc3-4c74-b0d1-4d5dd575182e 
#https://euw.api.pvp.net/api/lol/euw/summoner/by-name/Yrthgze?api_key=2243b328-6fc3-4c74-b0d1-4d5dd575182e
print euw_api+'summoner/by-name/Yrthgze?api_key='+api_key
response = urllib2.urlopen(euw_api+'summoner/by-name/Yrthgze?api_key='+api_key)
html = json.load(response)
print html