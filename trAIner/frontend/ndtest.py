from __future__ import division
import numpy as np
from numpy import random
from scipy.spatial.distance import pdist, cdist
from scipy.stats import kstwobign, pearsonr
from scipy.stats import genextreme
from scic_dist_functions import *

def pearsn(x,y):
    """Given two arrays x[0..n-1] and y[0..n-1], this routine computes their correclation coefficient r 
    (returned as r), the p-value at which the null hypothesis of zero correlation is disproved (prob 
    whose small value indicates a significant correlation), and Fisher's z (return as z). whose value
    van be used in further statistical tests. r, prob and z are returned as an array.
    """
    TINY = 1.0e-20
    beta = Beta()
    n=len(x)
    yt=xt=t=df=syy=sxy=sxx=ay=ax=0.0
    for j in xrange(0,n):
        ax += x[j]
        ay += y[j]
    ax /= n
    ay /= n
    for j in xrange(0,n):
        xt=x[j]-ax
        yt=y[j]-ay
        sxx += xt*xt
        syy += yt*yt
        sxy += xt*yt
    r = sxy/(math.sqrt(sxx*syy)+TINY)
    z = 0.5*math.log((1.0+r+TINY)/(1.0-r+TINY))
    df = n-2
    t = r*math.sqrt(df/((1.0-r+TINY)*(1.0+r+TINY)))
    prob = beta.betai(0.5*df, 0.5, df/(df+t*t))
    
    return [r,prob,z]


def quadct(x,y,xx,yy):
    """Given an origin (x,y), and an array of nn points with coordinates
    xx[0..nn-1] and yy[0..nn-1], count how many of them are in each
    quadrant around the origin, and return the normalized fractions.
    Quadrants are labeled alphabetically, a counterclockwise from the 
    upper right. Used by ks2d1s and ks2d2s.
    """
    na=nb=nc=nd=0
    nn = len(xx)
    for k in xrange(nn):
        if(yy[k]==y and xx[k]==x): continue
        if(yy[k]>y):
            if(xx[k]>x): na += 1
            else: nb += 1
        else:
            if(xx[k]>x): nd += 1
            else: nc += 1
    ff=1.0/nn
    return [ff*na,ff*nb,ff*nc,ff*nd]

def ks2d2s(x1,y1,x2,y2):
    """Two-dimensional Kolmogorow-Smirnov test on two sampls. Given the x
    and y coordinates of the first sample as n1 values in arrays x1[0..n1-1]
    and y1[0..n1-1], and likewise for the second sample, n2 values in arrays
    x2 and y2, this routine returns the two-dimensional, two-sample K-S 
    statistic as d, and its p-value as prob, all as an array. Small values 
    of prob show that the two samples are significantly different. Note that
    the test is slightly distribution-dependent, so prob is only an estimate.
    """
    n1=len(x1)
    n2=len(x2)
    r1=r2=rr=dum=dumm=0.0
    ks = KSdist()
    d1=0.0
    for j in xrange(n1):
        [fa,fb,fc,fd] = quadct(x1[j],y1[j],x1,y1)
        [ga,gb,gc,gd] = quadct(x1[j],y1[j],x2,y2)
        if(fa>ga): fa += 1.0/n1
        if(fb>gb): fb += 1.0/n1
        if(fc>gc): fc += 1.0/n1
        if(fd>gd): fd += 1.0/n1
        d1 = max(d1,abs(fa-ga))
        d1 = max(d1,abs(fb-gb))
        d1 = max(d1,abs(fc-gc))
        d1 = max(d1,abs(fd-gd))
    d2=0.0
    for j in xrange(n2):
        [fa,fb,fc,fd] = quadct(x2[j],y2[j],x1,y1)
        [ga,gb,gc,gd] = quadct(x2[j],y2[j],x2,y2)
        if(ga>fa): ga += 1.0/n1
        if(gb>fb): gb += 1.0/n1
        if(gc>fc): gc += 1.0/n1
        if(gd>fd): gd += 1.0/n1
        d2 = max(d2,abs(fa-ga))
        d2 = max(d2,abs(fb-gb))
        d2 = max(d2,abs(fc-gc))
        d2 = max(d2,abs(fd-gd))
    d=0.5*(d1+d2)
    sqen=math.sqrt(n1*n2/float(n1+n2))
    [r1,dum,dumm] = pearsn(x1,y1)
    [r2,dum,dumm] = pearsn(x2,y2)
    rr = math.sqrt(1.0-0.5*(r1*r1+r2*r2))
    prob=ks.qks(d*sqen/(1.0+rr*(0.25-0.75/sqen)))
    return prob