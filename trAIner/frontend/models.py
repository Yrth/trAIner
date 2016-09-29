from django.db import models
from django_mongodb_engine.contrib import MongoDBManager

from djangotoolbox.fields import ListField, DictField

class Champions(models.Model):
    data = DictField()
    objects = MongoDBManager()
class items(models.Model):
    type = models.CharField(max_length=200)
    version = models.CharField(max_length=200)
    basic = DictField()
    data = DictField()
    group = ListField()
    tree = ListField()
    class MongoMeta:
        db_table = "items"

class masteries(models.Model):
    type = models.CharField(max_length=200)
    version = models.CharField(max_length=200)
    tree = DictField()
    data = DictField()
    class MongoMeta:
        db_table = "masteries"

class runes(models.Model):
    type = models.CharField(max_length=200)
    version = models.CharField(max_length=200)
    basic = DictField()
    data = DictField()
    class MongoMeta:
        db_table = "runes"

class summonerspells(models.Model):
    type = models.CharField(max_length=200)
    version = models.CharField(max_length=200)
    data = DictField()
    class MongoMeta:
        db_table = "summonerspells"

class Summoners(models.Model):
    _id = models.IntegerField(null=True)
    name = models.CharField(max_length=200)
    profileIconId = models.IntegerField()
    revisionDate = models.IntegerField()
    summonerLevel = models.IntegerField()
    hasStats = models.BooleanField(default=False)

class Stats(models.Model):
    _id = models.IntegerField(null=True)
    modifyDate = models.IntegerField()
    champions = ListField()
    matchList = ListField()
    league = DictField()
    objects = MongoDBManager()

class Matches(models.Model):
    _id = models.IntegerField(null=True)
    region = models.CharField(max_length=200)
    matchType = models.CharField(max_length=200)
    matchCreation = models.IntegerField()
    participants = ListField()
    platformId = models.CharField(max_length=200)
    matchMode = models.CharField(max_length=200)
    participantIdentities = ListField()
    matchVersion = models.CharField(max_length=200)
    teams = ListField()
    mapId = models.IntegerField()
    season = models.CharField(max_length=200)
    queueType = models.CharField(max_length=200)
    matchDuration = models.IntegerField()
    timeline = DictField()
    objects = MongoDBManager()
        







        
