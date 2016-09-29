from django.conf.urls import patterns, url

from frontend import views

urlpatterns = patterns('',
    
    url(r'^init_status$', views.init_status, name='istatus'),
    url(r'^status$', views.status_fun, name='status'),
    url(r'^get_object_by_id/(?P<obid>\w+)$', views.get_object_by_id, name='get_object_by_id'),
    url(r'^getsummonerdata/(?P<username>[\w|\s]+)/(?P<mode>\w+)/(?P<label>\w+)/(?P<season>\w+)', views.get_summoner_data),
    url(r'^$', views.index, name='index'),
)