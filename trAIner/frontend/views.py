# -*- coding: utf-8 -*-
from django.shortcuts import render
from django.http import HttpResponse,StreamingHttpResponse
from frontend.models import *
import urllib2
import json
import inspect
from random import randint
from periodicTaskFunctions import PeriodicTask
from pymongo import MongoClient
#import json
from ndtest import *
from math import *
#obtener todos los campeones del rol que se ha elegido o el campeon en si, obtener sus id.
#con el id o los id, ir buscando aleatoriamente dentro de las partidas del jugador que se analiza
#y recursivamente coger datos de partidas asociadas a los asociados e ir mirando si esta en la lista de ids
#hasta tener 100 partidas ajenas con las que comparar nuestra media. o mejor todavia comparar las partidas 
#que ya estan descargadas, obviamente si es de estudiar el personaje si que habra que descargar

#db.getCollection('frontend_matches').aggregate([{'$match':{'participants.championId':{'$in':[25]}}},{'$unwind':'$participants'},{'$match':{'participants.championId':{'$in':[25]}}}])      para conseguir todas las partidas con campeones especificos

api_key = 'RGAPI-EE525376-05CB-4D55-AA2D-7D6940F08B11'
api_key2 = 'RGAPI-BC2ABDDB-297B-48C6-B9BD-A7E9FD8CD1C0'
api_to_use = api_key
euw_api = 'https://euw.api.pvp.net/api/lol/euw/'
status = 0
status_complete = 0
#dbConn = MongoClient().trAIner_db
dbConn = MongoClient('localhost',32402).trAIner_db

def sim_list(seqA, seqB):
    return sum([abs(a - b) for (a, b) in zip(seqA, seqB)])
 
def euclidean_distance(x,y):
    return sqrt(sum(pow(a-b,2) for a, b in zip(x, y)))

def get_champions_by_tag(tag):
    data = Champions.objects.last()
    data = data.data
    ch_tr = []
    for x in data:
        if tag in data[x]['tags']:
            ch_tr.append(int(data[x]['key']))
    return ch_tr

def change_api_key():
    global api_to_use, api_key, api_key2
    if api_to_use == api_key:
        api_to_use = api_key2
    else:
        api_to_use = api_key
    print "Cambiando API key a: "+api_to_use

def status_fun(request):
    global status
    return StreamingHttpResponse(json.dumps({'status':status,'status_complete':status_complete}),content_type="application/json")

def init_status(request):
    global status
    global status_complete
    status = 0
    status_complete = 0

def index(request):
    #if not task.running:
    #    task.run()
    ob = Champions.objects.last()
    ob = ob.data
    tags = []
    for x in ob:
        for y in ob[x]['tags']:
            if y not in tags and y!='Figher':
                tags.append(y)
    return render(request, 'frontend/index.html', {'data':ob,'tags':tags})

def get_champion(champion):
    champ = Champions.objects.last()
    for x in champ.data:
        if champion == champ.data[x]['id']:
            return champ.data[x]

def get_champion_by_id(champion_id):
    champ = Champions.objects.last()
    for x in champ.data:
        if int(champion_id) == int(champ.data[x]['key']):
            return champ.data[x]

def get_summoner_by_id(summoner_id):
    try:
        summoner = Summoners.objects.get(_id=int(summoner_id))
    except:
        #No tenemos al usuario en la base
        try:
            change_api_key()
            response = urllib2.urlopen(euw_api+'v1.4/summoner/'+summoner_id+'?api_key='+api_key)
            data = json.load(response).itervalues().next()
            summoner = Summoners(_id=int(data['id']),name=str(data['name']),profileIconId=int(data['profileIconId']),revisionDate=int(data['revisionDate']),summonerLevel=int(data['summonerLevel'])).save()
            summoner = Summoners.objects.get(name=name)
        except urllib2.HTTPError, e:
            if int(e.code) == 429:
                change_api_key()
            return "No hemos conseguido datos del usuario, error: "+str(e.code)
    summoner_id = summoner.pk
    #Tenemos en la base de datos al usuario
    return summoner_id

def get_summoner_by_name(name):
    try:
        summoner = Summoners.objects.get(name=name)
    except:
        #No tenemos al usuario en la base
        try:
            change_api_key()
            response = urllib2.urlopen(euw_api+'v1.4/summoner/by-name/'+name.replace(' ','%20')+'?api_key='+api_to_use)
            data = json.load(response).itervalues().next()
            summoner = Summoners(_id=int(data['id']),name=str(data['name']),profileIconId=int(data['profileIconId']),revisionDate=int(data['revisionDate']),summonerLevel=int(data['summonerLevel'])).save()
            summoner = Summoners.objects.get(name=name)
        except urllib2.HTTPError, e:
            if int(e.code) == 429:
                change_api_key()
            return "El usuario no existe"
    summoner_id = summoner.pk
    #Tenemos en la base de datos al usuario
    return summoner_id

def get_league_data(summoner_id):
    try:
        change_api_key()
        response = urllib2.urlopen(euw_api+'v2.5/league/by-summoner/'+str(summoner_id)+'?api_key='+api_to_use)
        data = json.load(response)
        data = data.itervalues().next()
        for x in data:
            if x['queue'] == "RANKED_SOLO_5x5" or x['queue'] == "RANKED_TEAM_5x5":
                return x
    except:
        return {'queue':'none','tier':'none'}

def get_summoner_stats(summoner_id,season):
    try:
        stats = Stats.objects.get(_id=int(summoner_id))
    except:
        #No tenemos stats del jugador
        try:
            #league = get_league_data(summoner_id)
            change_api_key()
            print euw_api+'v2.2/matchlist/by-summoner/'+str(summoner_id)+'?api_key='+api_to_use
            response = urllib2.urlopen(euw_api+'v2.2/matchlist/by-summoner/'+str(summoner_id)+'?api_key='+api_to_use)
            print "asdasdasd"
            matchlist = json.load(response)['matches']
            #Lo que se debe hacer es coger los id que se van a usar realmente y descargar esos, los demas no nos sirven.
            change_api_key()
            try:
                response = urllib2.urlopen(euw_api+'v1.3/stats/by-summoner/'+str(summoner_id)+'/ranked?season='+season+'&api_key='+api_to_use)
            except:
                return "El usuario no tiene partidas que analizar en la temporada seleccionada"
            data = json.load(response)

            stats = Stats(_id=int(data['summonerId']),modifyDate=int(data['modifyDate']),champions=data['champions'],matchList=matchlist,league={}).save()
            
            print stats
            stats = Stats.objects.get(_id=summoner_id)
        except urllib2.HTTPError, e:
            if int(e.code) == 429:
                change_api_key()
            return "El usuario no existe"
        except Exception, e:
            return "error"
    return stats
    
def get_match_data(match_id):
    try:
        Matches.objects.get(_id=int(match_id))
    except:
        print "No hay partida con id "+str(match_id)
        try:
            change_api_key()
            response = urllib2.urlopen(euw_api+'v2.2/match/'+str(match_id)+'?includeTimeline=true&api_key='+api_to_use)
            data = json.load(response)
            match = Matches(_id=data['matchId'],mapId=data['mapId'],matchCreation=data['matchCreation'],matchDuration=data['matchDuration'],matchMode=data['matchMode'],matchType=data['matchType'],matchVersion=data['matchVersion'],participantIdentities=data['participantIdentities'],participants=data['participants'],platformId=data['platformId'],queueType=data['queueType'],region=data['region'],season=data['season'],teams=data['teams'],timeline=data['timeline']).save()

        except urllib2.HTTPError, e:
            if int(e.code) == 429:
                change_api_key()
            print "No se ha podido coger datos de la partida: "+str(match_id)+' porque error: '+str(e.code)
        except Exception, e:
            return "error"

def get_match_list(stats,summoner_id, qfilter, qkey,season):
    #qfilter might be lane (BOTTOM;MID;MIDDLE;TOP;JUNGLE;BOT) or champion id
    matchlist = stats.matchList

    data_f = []
    if qfilter == 'champion':
        #data = Stats.objects.raw_query({'matchList.champion':int(qkey)})
        dbConn.authenticate('yrth', '12345')
        data = list(dbConn.frontend_stats.aggregate([{'$match':{'_id':int(summoner_id)}},{'$unwind':'$matchList'},{'$match':{'matchList.champion':int(qkey),'matchList.season':season}},{'$project':{'matchId':'$matchList.matchId','champion':'$matchList.champion'}},{'$sort':{'timestamp':-1}}]))[0:49]
        for x in data:
            data_f.append(int(x['matchId']))
        matches = data_f
    else:
        champs_used = stats.champions
        for x in champs_used:
            champ_id = x['id']
            champ_used = get_champion_by_id(champ_id)
            try:
                if qkey in champ_used['tags']:
                    data_f.append(int(champ_id))
            except Exception, e:
                pass  
        dbConn.authenticate('yrth', '12345')       
        data = list(dbConn.frontend_stats.aggregate([{'$match':{'_id':int(summoner_id)}},{'$unwind':'$matchList'},{'$match':{'matchList.champion':{'$in':data_f},'matchList.season':season}},{'$project':{'matchId':'$matchList.matchId','champion':'$matchList.champion'}},{'$sort':{'timestamp':-1}}]))[0:49]
        data_f = []
        for x in data:
            data_f.append(int(x['matchId']))
        matches = data_f
    print len(matches)
    for x in xrange(0,len(matches)):
        global status_complete
        status_complete = float(float(x) / float(len(matches)))
        get_match_data(matches[x])

    return matches
    #print matchlist.raw_query(champion=29)

def get_match_stat_data(matches):
    matches = Matches.objects.raw_query({'_id':{"$in":matches}})
    return matches

def get_participant_id(match,summoner_id):
    seed_id = 0
    for part in match.participantIdentities:
        if int(part['player']['summonerId']) == int(summoner_id):
            participant_id = part['participantId']
        elif int(part['player']['summonerId']) != int(summoner_id) and seed_id == 0:
            seed_id = part['player']['summonerName']
    return participant_id, seed_id


def get_participant_frames(timeline,p_id):
    frames = []
    for x in timeline:
        frames.append(x['participantFrames'][str(p_id)])
    return frames


#CUANDO NO ES PARTICIPANTID SALTA EXCEPCIÓN Y POR ESO NO COGE BIEN TODOS LOS EVENTOS.
def get_participant_events(timeline,p_id):
    participant_events = []
    for x in timeline:
        if 'events' in x:
            events = x['events']
            for y in events:
                try:
                    #y['mid'] = mid
                    if 'participantId' in y and y['participantId'] == p_id:
                        y['ttype'] = 'none'
                        participant_events.append(y)
                    elif 'creatorId' in y and y['creatorId'] == p_id:
                        y['ttype'] = 'none'
                        participant_events.append(y)
                    elif 'killerId' in y and y['killerId'] == p_id:
                        if y['eventType'] == 'BUILDING_KILL':
                            y['ttype'] = 'tower_killer'
                        elif y['eventType'] == 'CHAMPION_KILL':
                            y['ttype'] = 'killer'
                        elif y['eventType'] == 'WARD_KILL':
                            y['ttype'] = 'ward_killer'
                        else:
                            y['ttype'] = 'none'
                        participant_events.append(y)
                    elif 'victimId' in y and y['victimId'] == p_id:
                        y['ttype'] = 'victim'
                        participant_events.append(y)
                    elif 'assistingParticipantIds' in y and p_id in y['assistingParticipantIds']:
                        if y['eventType'] == 'BUILDING_KILL':
                            y['ttype'] = 'tower_assister'
                        else:
                            y['ttype'] = 'assister'
                        participant_events.append(y)
                except:
                    pass
    return participant_events

def analyze_events(events_total):
    objects_used = {}
    kill_ts = []
    victim_ts = []
    assist_ts = []
    tower_kill_ts = []
    tower_assister_ts = []
    skill_up_order = []
    ward_placed = []
    for events_list in events_total:
        sk_order = []
        wa_placed = []
        for event in events_list:
            if 'ttype' not in event:
                print event
            if event['eventType'] == 'ITEM_PURCHASED':
                if str(event['itemId']) in objects_used:
                    objects_used[str(event['itemId'])].append(event['timestamp'])
                else:
                    objects_used[str(event['itemId'])] = [event['timestamp']]
            elif event['eventType'] == "SKILL_LEVEL_UP":
                sk_order.append({'timestamp':event['timestamp'],'skillSlot':event['skillSlot']})
            elif event['eventType'] == "WARD_PLACED":
                wa_placed.append(event['timestamp'])
            elif event['ttype'] == 'killer':
                kill_ts.append({'timestamp':event['timestamp'],'position':event['position']})
            elif event['ttype'] == 'victim':
                victim_ts.append({'x':event['position']['x'],'y':event['position']['y']})
            elif event['ttype'] == 'assister':
                assist_ts.append({'timestamp':event['timestamp'],'position':event['position']})
            elif event['ttype'] == 'tower_killer':
                tower_kill_ts.append({'timestamp':event['timestamp'],'position':event['position']})
            elif event['ttype'] == 'tower_assister':
                tower_assister_ts.append({'timestamp':event['timestamp'],'position':event['position']})
        skill_up_order.append(sk_order)
        ward_placed.append(wa_placed)
    kill_ts = len(kill_ts)
    assist_ts = len(assist_ts)
    tower_kill_ts = len(tower_kill_ts)
    tower_assister_ts = len(tower_assister_ts)

    return {'objects':objects_used,'kills':kill_ts,'deaths':victim_ts,'assists':assist_ts,'tower_kill':tower_kill_ts,'tower_assist':tower_assister_ts,'skill_up':skill_up_order,'wards':ward_placed}

def analyze_frames(frames):
    lengths = []
    for x in frames:
        lengths.append(len(x))
    max_l = max(lengths)
    gold_averages = []
    minion_averages = []
    j_minion_averages = []
    level_averages = []
    for x in xrange(0,max_l):
        gold_sum = 0
        minion_sum = 0
        j_minion_sum = 0
        level_sum = 0
        counter = 0
        for frame in frames:
            if len(frame) > x:
                gold_sum += frame[x]['currentGold']
                minion_sum += frame[x]['minionsKilled']
                j_minion_sum += frame[x]['jungleMinionsKilled']
                level_sum += frame[x]['level']
                counter += 1
        if counter > 0:
            gold_average = gold_sum / counter
            minion_average = round(minion_sum / counter)
            j_minion_average = round(j_minion_sum /counter)
            level_average = round(level_sum / counter)
        else:
            average = 0
        gold_averages.append(gold_average)
        minion_averages.append(minion_average)
        j_minion_averages.append(j_minion_average)
        level_averages.append(level_average)
    return {'gold_average':gold_averages,'minion_average':minion_averages,'j_minion_average':j_minion_averages,'level_average':level_averages}

def getKey(x):
    return -x['value']

def sort_and_cut(matches):
    sr_m = sorted(matches,key =getKey)
    return sr_m

def get_object_average(data):
    obj = {}
    for x in data:
        for y in x:
            if y in obj:
                obj[y] += 1
            else:
                obj[y] = 1
    print obj
    return obj

def analyze_matches(matches,summoner_id,mode,label):
    participant_frames = []
    participant_events = []
    final_objects_average = []
    final_objectsavg_average = []
    print matches
    for match in matches:
        participant_id, seed_name = get_participant_id(match,summoner_id)
        participant_frames.append(get_participant_frames(match.timeline['frames'],participant_id))
        participant_events.append(get_participant_events(match.timeline['frames'],participant_id))
        m_stats = match.participants[participant_id-1]['stats']
        final_objects_average.append([m_stats['item0'],m_stats['item1'],m_stats['item2'],m_stats['item3'],m_stats['item4'],m_stats['item5'],m_stats['item6']])
    events_analyzed = analyze_events(participant_events)
    averages = analyze_frames(participant_frames)
    user_deaths = len(events_analyzed['deaths'])

    #//Código que consigue las mejores partidas del rol elegido o del personaje elegido
    champ_tags = []
    if mode == 'champion':
        champ_id = get_champion(label)['key']
        champ_tags = get_champion(label)['tags']
        avg_matches = list(dbConn.frontend_matches.aggregate([{'$match':{'participants.championId':int(champ_id)}},{'$unwind':'$participants'},{'$match':{'participants.championId':int(champ_id)}},{'$limit':1000}]))
    else:
        champions_related = get_champions_by_tag(label)
        dbConn.authenticate('yrth', '12345')
        avg_matches = list(dbConn.frontend_matches.aggregate([{'$limit':100},{'$match':{'participants.championId':{'$in':champions_related}}},{'$unwind':'$participants'},{'$limit':1000},{'$match':{'participants.championId':{'$in':champions_related}}}]))
    for x in avg_matches:
        x['kd'] = x['participants']['stats']['kills']/float(x['participants']['stats']['deaths']+1)
        x['ad'] = x['participants']['stats']['assists']/float(x['participants']['stats']['deaths']+1)
        x['value'] = x['kd'] + x['ad']
    sorted_matches = sort_and_cut(avg_matches)
    iter_n = 0
    total_d_s = 0
    for x in sorted_matches:
        total_d_s += x['participants']['stats']['deaths']
        iter_n += 1
        if total_d_s >= user_deaths:
            break
    sorted_matches = sorted_matches[0:iter_n]
    avg_frames = []
    avg_events = []
    for match in sorted_matches:
        participant_id = match['participants']['participantId']
        avg_frames.append(get_participant_frames(match['timeline']['frames'],participant_id))
        avg_events.append(get_participant_events(match['timeline']['frames'],participant_id))
        m_stats = match['participants']['stats']
        final_objectsavg_average.append([m_stats['item0'],m_stats['item1'],m_stats['item2'],m_stats['item3'],m_stats['item4'],m_stats['item5'],m_stats['item6']])
    avg_events_analyzed = analyze_events(avg_events)
    avg_averages = analyze_frames(avg_frames)
    #db.getCollection('frontend_matches').aggregate([{'$match':{'participants.championId':{'$in':[25]}}},{'$unwind':'$particip'},{'$match':{'participants.championId':{'$in':[25]}}}])      para conseguir todas las partidas con campeones especificos
    ead = events_analyzed['deaths']
    aead = avg_events_analyzed['deaths']
    x1 = [x['x'] for x in ead]
    y1 = [x['y'] for x in ead]
    x2 = [x['x'] for x in aead]
    y2 = [x['y'] for x in aead]
    ksval = ks2d2s(x1,y1,x2,y2)
    point1 = [avg_events_analyzed['kills']/float(len(avg_events_analyzed['deaths'])+1),avg_events_analyzed['assists']/float(len(avg_events_analyzed['deaths'])+1)]
    point2 = [events_analyzed['kills']/float(len(events_analyzed['deaths'])+1),events_analyzed['assists']/float(len(events_analyzed['deaths'])+1)]
    eu_dis = euclidean_distance(point1,point2)
    eu_dis1 = euclidean_distance(point1,[0,0])
    eu_dis2 = euclidean_distance([0,0],point2)
    list_sim = sim_list(avg_averages['gold_average'],averages['gold_average'])
    mini_sim = sim_list(avg_averages['minion_average'],averages['minion_average'])
    j_mini_sim = sim_list(avg_averages['j_minion_average'],averages['j_minion_average'])
    lvl_sim = sim_list(avg_averages['level_average'],averages['level_average'])
    final_objects_average = get_object_average(final_objects_average)
    final_objectsavg_average = get_object_average(final_objectsavg_average)
    print "terminated"
    return {'champ_tags':champ_tags,'final_objects_average':final_objects_average,'final_objectsavg_average':final_objectsavg_average,'list_sim':list_sim,'mini_sim':mini_sim,'j_mini_sim':j_mini_sim,'lvl_sim':lvl_sim,'eu_dis':eu_dis,'eu_dis1':eu_dis1,'eu_dis2':eu_dis2,'ksval':ksval,'pe':events_analyzed,'averages':averages,'match_count':len(matches),'avg_mc':len(sorted_matches),'avg_events':avg_events_analyzed,'avg_averages':avg_averages}

def get_object_by_id(request,obid):
    dbConn.authenticate('yrth', '12345')
    item = dbConn.items.find_one()
    item = item['data'][str(obid)]
    item['id_o'] = str(obid)
    return StreamingHttpResponse(json.dumps(item),content_type="application/json")

def get_summoner_data(request,username,mode,label,season):
    global status
    print season
    status = 0
    #Primero, necesitamos saber si tenemos datos del jugador o no y conseguir su id
    summoner_id = get_summoner_by_name(username)
    if summoner_id == "El usuario no existe":
        print "No existe aqui"
        return StreamingHttpResponse(json.dumps({'error':'Este jugador no existe, comprueba que has escrito bien el nombre'}),content_type="application/json")
    status = 1
    #Ahora necesitamos el resto de sus estadisticas
    stats = get_summoner_stats(summoner_id,season)
    if stats == "El usuario no existe":
        print "No existe aqui2"
        return StreamingHttpResponse(json.dumps({'error':'Este jugador no existe, comprueba que has escrito bien el nombre'}),content_type="application/json")
    if stats == "El usuario no tiene partidas que analizar en la temporada seleccionada":
        return StreamingHttpResponse(json.dumps({'error':'El usuario no tiene partidas que analizar en la temporada seleccionada'}),content_type="application/json")
    print stats
    status = 2
    print "Buscando partidas"
    if mode == 'champion':
        champ = get_champion(label)
        ml = get_match_list(stats,summoner_id,mode,champ['key'],season)
    else:
        ml = get_match_list(stats,summoner_id,mode,label,season)
    if len(ml) < 1:
        status = 0
        print "No existe aqui3"
        if mode=='champion':
            return StreamingHttpResponse(json.dumps({'error':'Este jugador no ha jugado partidas con '+champ['name']}),content_type="application/json")
        return StreamingHttpResponse(json.dumps({'error':'Este jugador no ha jugado partidas con el rol '+label}),content_type="application/json")
    status = 3
    mtc = get_match_stat_data(ml)
    print "Terminado obtencion de datos para analisis"
    data_tosend = analyze_matches(mtc,summoner_id,mode,label)
    print "Terminado analisis"
    #data_tosend = {}
    #mtc = get_match_list(30720731,'champion',29)
    #mtc = get_match_stat_data(mtc)
    #data_tosend = analyze_matches(mtc,30720731)
    data_tosend = json.dumps(data_tosend)
    final_response = StreamingHttpResponse(data_tosend,content_type="application/json")
    print "Terminada final_response"
    status = 0
    return final_response

######-----Periodic task--------##########

def get_random_summoner(match):
    for x in match.participantIdentities:
        p_summoner = x['player']['summonerName']
        try:
            summoner = Summoners.objects.get(name=p_summoner)
        except Exception, e:
            print "No tenemos al usuario "+p_summoner
            summoner = get_summoner_by_name(p_summoner)
            stats = get_summoner_stats(summoner)
            return summoner
    return None

def seek_random_matches():
    summoner = None
    summoner_s = None
    matches = Matches.objects.all()
    while summoner == None or summoner_s == None:
        r_i = randint(0, len(matches) - 1)
        match = matches[r_i]
        summoner = get_random_summoner(match)
        summoner_s = get_summoner_stats(summoner)
    ml = summoner_s.matchList[0:5]
    for x in ml:
        try:
            get_match_data(x['matchId'])
        except Exception, e:
            if int(e.code) == 429:
                change_api_key()
            print "No se ha conseguido obtener datos de la partida "+x['matchId']+' Error: '+str(e.code)

def periodic_task():
    try:
        seed_id = seek_random_matches()
    except:
        print "Error en periodic task pero seguimos "
        
#task = PeriodicTask(interval=30, callback=periodic_task)

######-------------------##########