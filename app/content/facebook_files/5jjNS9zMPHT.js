/*!CK:1480486518!*//*1400115654,178134573*/

if (self.CavalryLogger) { CavalryLogger.start_js(["LGkSr"]); }

__d("PhotoTagSearchPivotLogger",["Banzai"],function(a,b,c,d,e,f,g){var h={};g.subscribe(g.SHUTDOWN,function(){Object.keys(h).forEach(function(l){var m=h[l];Object.keys(m).forEach(function(n){g.post('photo_tag_search_pivot',{source:l,action:n,count:m[n]});});});});var i=/^(perm:)?tag:/,j,k={logImpression:function(l,m){var n=l in h?h[l]:(h[l]={});n[m]=m in n?n[m]+1:1;},logImageImpression:function(l,m,n){if(j!==m){if(n.some(function(o){return i.test(o);}))this.logImpression(l,'image_impression');j=m;}},logPivotImpression:function(l,m){if(i.test(m))this.logImpression(l,'pivot_impression');}};e.exports=k;});