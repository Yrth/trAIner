from frontend.models import *
import urllib2
import json
from datetime import datetime
from threading import Timer


class PeriodicTask(object):
    def __init__(self, interval, callback, daemon=True, **kwargs):
        self.interval = interval
        self.callback = callback
        self.daemon   = daemon
        self.kwargs   = kwargs
        self.running = False
        self.run()
        
    def run(self):
        self.callback(**self.kwargs)
        t = Timer(self.interval, self.run)
        t.daemon = self.daemon
        self.running = True
        t.start()




#cosa
#if mode == 'champion':
#            pass
#        else:
#            seed_id = get_summoner_by_name(seed_name)
#            seed_stats = get_summoner_stats(seed_id)
#            print "-----"
#            print seed_id
#            print "----"
#            print seed_name
#            print "Inside"
#            print seed_stats
#            print "----"
            #ml = [get_match_list(seed_stats,seed_id,mode,label)[0]]
            
            #mtc = get_match_stat_data(ml)