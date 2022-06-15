/****************************************************************************
 ** @license
 ** This file is part of yFiles for HTML 2.3.0.3.
 **
 ** yWorks proprietary/confidential. Use is subject to license terms.
 **
 ** Copyright (c) 2020 by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ***************************************************************************/
!function($){var f;f=function($,f){return function($,f,n,t){"use strict";function r($,f){return c($,f.$f2)}function e(f){var n,t=new $.FE,r=f.length;if(f.length<3)return t;if(3===r){n=a(f,0),t.$m(n);for(var e=.01;e<=1;e+=.01)n=a(f,e),t.$m(n)}else{for(var u=[null,null,null,null],o=0;o<u.length-1;o++)u[o]=f[0];var l=u[0],s=null;for(o=1;o<f.length+2;o++){u[3]=o<r?f[o]:f[r-1],t.$m(l);for(e=1;e<=10;e++)s=i(u,e/10),t.$m(s);l=s,u[0]=u[1],u[1]=u[2],u[2]=u[3]}}return function($,f){if($.$nX<3)return;var n=$.$m14(),t=n.$m();for(;n.$p;){var r=n.$m();if(!(t.$RUG(r)<f))break;n.$m1()}if($.$nX<3)return;var e=$.$m11($.$nX),i=e.$m2();for(;e.$p1;){var r=e.$m2();if(!(i.$RUG(r)<f))break;e.$m1()}}(t,5),function f(n,t,r,e){var i=0;var a=t;var u=new $.FE;for(var o=a+1;o<r;++o){var l=n.$qX(o),s=n.$qX(t),m=n.$qX(r),h=$.T.SVA.$I(l.$f,l.$f1,s.$f,s.$f1,m.$f,m.$f1);h>i&&(a=o,i=h)}if(i>e){var c=f(n,t,a,e),T=f(n,a,r,e);u.$m15(c),u.$m15(T)}else u.$m(n.$qX(t)),u.$m(n.$qX(r));return u}(t,0,t.$nX-1,1)}function i(f,n){var t=[[-1,3,-3,1],[3,-6,3,0],[-3,0,3,0],[1,4,1,0]];t=u([[Math.pow(n,3),Math.pow(n,2),n,1]],t);var r=[[f[0].$f],[f[1].$f],[f[2].$f],[f[3].$f]],e=[[f[0].$f1],[f[1].$f1],[f[2].$f1],[f[3].$f1]],i=u(t,r)[0][0]/6,a=u(t,e)[0][0]/6;return new $.C.FWA.$v($.VE.$m6(i),$.VE.$m6(a))}function a(f,n){var t=Math.pow(1-n,2)*f[0].$f+2*(1-n)*n*f[1].$f+Math.pow(n,2)*f[2].$f,r=Math.pow(1-n,2)*f[0].$f1+2*(1-n)*n*f[1].$f1+Math.pow(n,2)*f[2].$f1;return new $.C.FWA.$v(t,r)}function u(n,t){for(var r=$.VE.createArrayWithTypeD1AndD2(f.lang.Number.$class,n.length,t[0].length),e=0;e<n.length;e++)for(var i=0;i<t[0].length;i++){r[e][i]=0;for(var a=0;a<n[0].length;a++)r[e][i]=r[e][i]+n[e][a]*t[a][i]}return r}function o(f,n,t,r){var e=n.$f2,i=n.$f3,a=T(f,e).$m7(),u=T(f,i).$m7(),o=r?$.ORA.$f:$.ORA.$f2;o===$.ORA.$f?u=T(f,u).$m6():(u=T(f,u).$m8(),a=T(f,a).$m8());var m=function(f,n,t,r){var e,i,a=null;r===$.ORA.$f?(e=l(f,n,$.ORA.$f),i=l(f,t,$.ORA.$f1)):(e=l(f,n,$.ORA.$f2),i=l(f,t,$.ORA.$f2));var u=new $.ME.$c(i);if(1===e.$f1)a=n;else if(1===i.$f1)a=t;else for(var o=e.$m3();o.$p;){var s=o.$m();if(r===$.ORA.$f){if(u.$zY(T(f,s).$m6())||u.$zY(s)){a=s;break}}else if(u.$zY(s)){a=s;break}}return a}(f,a,u,o),h=null;if(null===m){h=l(f,a,o===$.ORA.$f?$.ORA.$f:$.ORA.$f2);for(var c=(C=l(f,u,o===$.ORA.$f?$.ORA.$f:$.ORA.$f2).$sMG()).length-1;c>=0;c--)h.$m5(C[c])}else if(m!==u&&m!==T(f,u).$m6()&&(h=s(f,a,m,o===$.ORA.$f?$.ORA.$f:$.ORA.$f2)),m!==a&&m!==T(f,a).$m6()){var v=s(f,u,o===$.ORA.$f&&m!==f.$f?f.$f2.$Hk(m).$m6():m,o===$.ORA.$f?$.ORA.$f1:$.ORA.$f2);null===h&&(h=new $.C.EXA.$u);var C,_=new $.ME.$c(h);for(c=(C=v.$sMG()).length-1;c>=0;c--){var G=T(f,R=C[c]);_.$zY(G)||_.$zY(G.$m6())||h.$m5(R)}}var A=new $.FE;for(c=0;c<h.$f1;c++){var R=h.$qX(c);A.$m(f.$f1.$BUG(R))}return function(f,n){var t=$.DF.$m11(f.$nX),r=f.$nX-1;t[0]=f.$qX(0),t[r]=f.$qX(r);for(var e=1;e<r;e++){var i=f.$qX(e),a=n*i.$f+(1-n)*(t[0].$f+e/r*(t[r].$f-t[0].$f)),u=n*i.$f1+(1-n)*(t[0].$f1+e/r*(t[r].$f1-t[0].$f1));t[e]=new $.C.FWA.$v(a,u)}return t}(A,t)}function l(f,n,t){var r=new $.C.EXA.$u;r.$m5(n);for(var e=m(f,n,t);null!==e;)r.$m5(e),e=m(f,e,t);return r}function s(f,n,t,r){for(var e=new $.C.EXA.$u,i=!1,a=n;!i;)e.$m5(a),a.equals(t)?i=!0:a=m(f,a,r);return e}function m(f,n,t){var r=T(f,n);return t===$.ORA.$f?r.$m2():t===$.ORA.$f1?r.$m4():r.$m5()}function h(f,n,t){var r=n.$hZH($.T.BHC.EDGE_BUNDLE_DESCRIPTOR_DP_KEY);if(null!==r){var e=r.$Hk(t);if(null!==e)return e}return new $.C.AHC.$v(f.$f3.$jDG)}function c(f,n){return null!==T(f,n)&&T(f,n).$m3()===$.ORA.T.$f}function T($,f){return $.$f2.$Hk(f)}function v($,f,n){$.$f2.$jp(f,n)}function C($,f,n){return null===n||null===n.$Hk(f)?$.$zZG.$jDG:n.$Hk(f)}function _(f,n){return f.$f18||$.T.DKC.$v(n)}function G($,f,n){var t=n.$BUG($),r=Math.ceil(Math.max(t.$f-f.$f,f.$f+f.$f3-t.$f)),e=Math.ceil(Math.max(t.$f1-f.$f1,f.$f1+f.$f4-t.$f1));n.$VrH($,2*r,2*e),n.$EnH($,t)}function A(f,n,t){if(null===n||null===t)return null===n?t:n;var r=Math.min(n.$f,t.$f),e=Math.max(n.$f+n.$f3,t.$f+t.$f3),i=Math.min(n.$f1,t.$f1),a=Math.max(n.$f1+n.$f4,t.$f1+t.$f4);return new $.C.HWA.$w(r,i,e-r,a-i)}function R(f,n){var t,r=$.T.LXA.$u(n),e=new $.C.IVA.$y(n.$gNG());e.$ZTG(r);for(var i=e.$WKG();i.$Ne;i.$wj())n.$pQG(i.$Ye);try{switch(f.$f9){case 0:t=$.T.PXA.$v(n);break;case 1:t=$.T.PXA.$z(n);break;case 2:default:t=$.T.PXA.$J(n,null)}}finally{for(i=e.$WKG();i.$Ne;i.$wj())n.$RRG(i.$Ye)}return t}function S(f,n,t){var r=n.$fNG(),e=n.$eNG();!function(f,n,t,r,e){for(var i=t[0].$m3().$f,a=0;a<t.length;a++)for(var u=t[a],o=u.$m3();null!==o;o=o.$HKG()){var l=o.$f;if(l instanceof $.SRA){var s=l;s.$f=f.$m12(n,s.$m4()),r.$jp(s.$m4(),s),u.$m9(Math.max(u.$m4(),s.$f/2))}else if(l instanceof $.QRA){var m=l,h=e.$Hk(m.$m6());null===h&&(h=new $.C.XXA.$u,e.$jp(m.$m6(),h)),h.$m5(m)}}(function(f,n,t,r,e,i){for(var a=1;a<t.length;a++)for(var u=t[a],o=u.$m3();null!==o;o=o.$HKG()){var l=o.$f;if(l instanceof $.SRA){for(var s=l,m=s.$m4(),h=n.$BUG(m),c=i,T=null,v=Number.MAX_VALUE,C=m.$iNG();C.$Ne;C.$wj()){var _=C.$Ye,G=_.$hSG(m),A=r.$Hk(G);if(A.$f1<s.$f1){var R=n.$BUG(G),S=h.$f-R.$f,w=h.$f1-R.$f1,E=S*S+w*w;E<v&&(c=A,v=E,T=_)}}if(s.$f1-c.$f1>1&&null!==T){for(var H=e.$Hk(T),g=c,d=H.$m3();d.$p;){var D=d.$m();g.$m2(D),D.$f3=g,g=D}s.$f3=g,g.$m2(s)}else s.$f3=c,c.$m2(s)}}})(0,n,t,r,e,i),function($,f,n,t){for(var r=f.$gNG();r.$Ne;r.$wj()){var e=r.$Ye,i=t.$Hk(e);if(null!==i&&null===i.$Da.$f3){for(var a=n.$Hk(e.$f2),u=n.$Hk(e.$f3),o=a.$f1<u.$f1?a:u,l=a.$f1<u.$f1?u:a,s=o,m=i.$f2;null!==m;m=m.$HKG()){var h=m.$f;h.$f3=s,s.$m3(h),s=h}s.$m3(l)}}}(0,n,r,e),function(f,n){n[0].$m3().$f.$m1();for(var t=1;t<n.length;t++)for(var r=n[t],e=null,i=null,a=-1,u=-1,o=r.$m3();null!==o;){var l=o.$f;if(l.$m()){l.$m1();var s=o,m=o.$HKG();if(null!==i){var h=l.$f11.$Da.$f2;if(u>h){for(var c=h<a,T=new $.C.XXA.$u,v=0,C=i.$f11.$f;null!==C;C=C.$GKG()){var _=C.$f;if(!(_.$f2>h))break;T.$tSG(_),v++}for(var G=l.$f11.$f2;null!==G;G=G.$HKG()){var _=G.$f;if(!(_.$f2<u))break;T.$GSG(_)}T.$zRG(new $.T.TSC.T3);for(var A=(u-h)/2,R=$.RG.$f4,S=$.RG.$f4,w=Number.MAX_VALUE,E=0,H=v,g=T.$f2;null!==g;g=g.$HKG()){var _=g.$f;if(_.$f3===l){var d=Math.abs(H-E);(d<S||d===S&&Math.abs(_.$f2-A)<w)&&(R=_.$f2,S=d,w=Math.abs(_.$f2-A)),E++}else H--}S>E&&(R=u+1);for(var g=T.$f2;null!==g;g=g.$HKG()){var _=g.$f;_.$f2<R&&_.$f3!==i?(l.$f11.$Ld(_),l instanceof $.QRA&&l.$m3(_),i.$m2(_),_.$f3=i):_.$f2>=R&&_.$f3!==l&&(i.$f11.$Ld(_),i instanceof $.QRA&&i.$m3(_),l.$m2(_),_.$f3=l)}if(i instanceof $.QRA&&!i.$m()){var D=i,M=i.$f3;do{M.$f11.$Ld(D),M.$m3(D),D=M,M=M.$f3}while(D instanceof $.QRA&&!D.$m())}if(l instanceof $.QRA&&!l.$m()){var D=l,M=l.$f3;do{M.$f11.$Ld(D),M.$m3(D),D=M,M=M.$f3}while(D instanceof $.QRA&&!D.$m())}if(i.$m1(),l.$m1(),c){for(var K=null,N=e.$GKG();null!==N;N=N.$GKG()){var D=N.$f;if(D.$m()){K=N;break}}null!==K?(s=K,m=i.$m()?e:o):l.$m()||(s=e)}else l.$m()||(s=e)}}s!==e&&(e=s,i=s.$f,a=i.$f11.$Da.$f2,u=i.$f11.$Ba.$f2),o=m}else o=o.$HKG()}}(0,t)}(f,n,t,r,e),E(f,t);for(var i=0;i<f.$f10;i++)w(f,t),E(f,t);!function(f,n,t,r,e){for(var i=n.$hZH($.T.TSC.NODE_INFO_DP_KEY),a=0;a<t.length;a++)for(var u=t[a],o=u.$m3();null!==o;o=o.$HKG()){var l=o.$f;l instanceof $.SRA?D(f,n,t,l,i):l instanceof $.QRA&&0===l.$f4&&M(f,t,o)}f.$f15&&function(f,n,t,r){if(f.$f15){for(var e=new $.WE,i=0;i<t.length;i++)for(var a=t[i],u=a.$m3();null!==u;u=u.$HKG()){var o=u.$f;if(o instanceof $.SRA){var l=o.$m4(),s=r.$Hk(l).$f1,m=s;null===e.$GZ(m)&&e.$QZ(m,new $.C.EXA.$u),e.$GZ(m).$m5(l)}}var h=$.VE.$m8($.KE.$m4(e.$Dd)[0]),c=$.VE.$m8($.KE.$m4(e.$Dd)[e.$Dd.$nX-1]);f.$f2=n.$fNG();for(var a=h;a<c;a++)for(var T=e.$GZ(a),i=0;i<T.$f1;i++)for(var v=T.$qX(i),C=r.$Hk(v),_=C.$m5(),G=C.$f4,A=a+1,R=e.$GZ(A),S=0;S<R.$f1;S++){var w=R.$qX(S),E=r.$Hk(w),H=E.$m5(),g=E.$f4,d=f.$f2.$Hk(w),D=0,M=n.$BUG(v),K=n.$BUG(w);null!==d&&(D=K.$RUG(n.$BUG(d))),H+g<=_+G&&(null===d||D>K.$RUG(M)&&f.$f3.$Nk(v)===f.$f3.$Nk(w))&&f.$f2.$jp(w,v)}n.$vpH($.T.TSC.$f2,f.$f2)}}(f,n,t,r);!function(f,n,t,r,e){for(var i=$.T.A.$x(n),a=$.T.TSC.$f3,u=n.$gNG();u.$Ne;u.$wj()){var o=u.$Ye;$.T.YJC.$V(n,o,!0),0===a--&&(i.$UKG(),a=$.T.TSC.$f3);var l=new $.C.XXA.$u,s=r.$Hk(o.$f2),m=r.$Hk(o.$f3),h=e.$Hk(o);if(l.$m5(s),null!==h)if(s.$f1<m.$f1)l.$URG(h);else for(var c=h.$f;null!==c;c=c.$GKG())l.$m5(c.$f);l.$m5(m);var T=s.$f1===m.$f1,v=K(f,T,f.$KwG<<24>>24);v instanceof $.HRA&&(v.$f5=f.$f21,v.$f2=f.$f11,v.$p=f.$f8);var C=v.$m(l,t);if(!$.KE.$m1(C))for(var _=n.$m37(o),G=$.KE.$m5(C);G.$p;){var A=G.$m();_.$Lq(A.$f,A.$f1)}}}(f,n,t,r,e)}(f,n,t,r,e),n.$eYH(e),n.$fYH(r)}function w(f,n){!function($,f){for(var n=0;n<f.length;n++)for(var t=f[n].$m3();null!==t;t=t.$HKG())t.$f.$m7()}(0,n);var t=n[0].$m3().$f;t.$f5=0,t.$f4=$.T.TSC.$f1,t.$f8=$.T.TSC.$f1;for(var r=n.length-1;r>0;r--)for(var e=n[r].$m1(),i=r<n.length-1?n[r+1].$m1():e,a=f.$tDG/180*Math.PI,u=a-2*Math.asin(e/i*Math.sin(a/2)),o=n[r].$m3();null!==o;o=o.$HKG()){if((s=o.$f).$f9=s.$f/e,s.$f8=s.$f9,s.$f7>0){s.$f8=Math.max(u,s.$f9);var l=s.$f7/i;s.$f9=Math.max(s.$f9,l)}null!==s.$f3&&(s.$f3.$f7+=n[r].$m1()*s.$f9)}for(r=0;r<n.length;r++)for(e=n[r].$m1(),i=r<n.length-1?n[r+1].$m1():e,o=n[r].$m3();null!==o;o=o.$HKG()){var s;if((s=o.$f).$m()){var m=s.$f7/i,h=Math.max(0,(s.$f4-s.$f8)/2),c=Math.min(s.$f4,s.$f8)/m,T=s.$f5+h;if(c<=1)for(var v=s.$f11.$f2;null!==v;v=v.$HKG()){(E=v.$f).$f5=T;var C=E.$f9*c;E.$f4=C,T+=C}else{var _=new $.C.XXA.$v(s.$f11);_.$zRG(new $.T.TSC.T1);for(var G=s.$f4,A=s.$f7,R=_.$f2;null!==R;R=R.$HKG()){A-=(E=R.$f).$f9*i,(C=E.$f9*c)>E.$f8?c=(G-=C=E.$f8)*i/Math.max(1,A):G-=C,E.$f4=C}var S=G/(2*s.$f11.$f1),w=s.$f5;for(v=s.$f11.$f2;null!==v;v=v.$HKG()){var E;w+=S,(E=v.$f).$f5=w,w+=S+E.$f4}}}}}function E(f,n){for(var t=0;t<n.length;t++){var r=n[t].$m1();if(t>0){var e=Math.max(f.$SyG,f.$AZG);e=Math.max(e,n[t-1].$m4()+n[t].$m4()+f.$f19),r=Math.max(r,n[t-1].$m1()+e)}if(r=H(f,r),n[t].$m6(r),t<n.length-1){for(var i=H(f,r+$.T.TSC.$f),a=n[t].$m3();null!==a;a=a.$HKG()){var u=a.$f;if(u.$m()){for(var o=0,l=u.$f11.$f2;null!==l;l=l.$HKG()){var s=l.$f;o+=s.$f,s.$f4>0&&(i=Math.max(i,s.$f/s.$f4))}var m=g(f,r,o);if(i=Math.max(i,m),u.$f4>0){var h=o/u.$f4;i=Math.max(i,h)}}}n[t+1].$m6(i)}}}function H(f,n){var t=f.$AZG;return t>0?Math.ceil(n/t-$.T.TSC.$f)*t:n}function g(f,n,t){if(0===t)return 0;if(n<$.T.TSC.$f||f.$tDG+$.T.TSC.$f>360)return t/$.T.TSC.$f1;for(var r=f.$tDG*Math.PI/360,e=Math.sin(r)/t,i=t/(n+t/(r+Math.sin(r))),a=Number.MAX_VALUE;;){var u=d(f,n,r,e,i),o=Math.abs(i-u);if(o>=a)break;if(o<$.T.TSC.$f){i=u;break}i=u,a=o}return t/i}function d($,f,n,t,r){var e=n-r/2;return r+(Math.sin(e)-f*t*r)/(Math.cos(e)/2+t*f)}function D(f,n,t,r,e){var i,a=r.$m4(),u=t[r.$f1].$m1(),o=$.T.TSC.T.$m1(u,r.$m5());(n.$EnH(a,o),null!==e)&&($.C.RWA.isInstance(e)?((i=new $.C.USC).$f2=r.$f1,i.$f=u,i.$f4=o,i.$f3=$.T.SVA.$u(r.$f5)-90,i.$f1=$.T.SVA.$u(r.$f4),e.$jp(a,i)):null!==(i=e.$Hk(a))&&(i.$f2=r.$f1,i.$f=u,i.$f4=o,i.$f3=$.T.SVA.$u(r.$f5)-90,i.$f1=$.T.SVA.$u(r.$f4)))}function M(f,n,t){var r=t.$f;r.$m4(n);for(var e=n[r.$f1],i=n[r.$f1].$m1(),a=null,u=null,o=1,l=e.$m7(t);null!==l&&l!==t;l=e.$m7(l)){if((s=l.$f).$f4>0){a=l;break}s instanceof $.QRA&&s.$m4(n),o++}for(l=e.$m8(t);null!==l&&l!==t;l=e.$m8(l)){var s;if((s=l.$f).$f4>0){u=l;break}s instanceof $.QRA&&s.$m4(n),o++}var m,h,c=a.$f,T=u.$f,v=f.$f19/(2*i),C=c instanceof $.SRA?c.$f/(2*i):v,_=T instanceof $.SRA?T.$f/(2*i):v,G=c===T?2*Math.PI:$.T.TSC.T.$m7(c.$m5(),T.$m5(),!0);G<C+_?h=m=c.$m5()+C-(C+_-G)/2:(m=c.$m5()+C,h=T.$m5()-_);var A=$.T.TSC.T.$m7(m,h,!0);o>1&&A<v*(o-1)&&(v=A/(o-1));for(var R=e.$m8(a),S=e.$m7(u);o>0;){var w=R.$f,E=w.$m8();if(A<0&&(A=0,h=m),1===o){N=$.T.TSC.T.$m5(m,E,h)?E:$.T.TSC.T.$m7(h,E,!0)<$.T.TSC.T.$m7(E,m,!0)?h:m,w.$f5=N-$.T.TSC.$f/2,w.$f4=$.T.TSC.$f;break}var H,g,d=Math.max(0,A-(o-1)*v)/o,D=$.T.TSC.T.$m2(m+d),M=$.T.TSC.T.$m7(h,m,!0)/2+$.T.TSC.$f,K=$.T.TSC.T.$m2(m-M);if($.T.TSC.T.$m5(K,E,D)){var N=$.T.TSC.T.$m5(m,E,D)?E:m;w.$f5=N-$.T.TSC.$f/2,w.$f4=$.T.TSC.$f;var y=$.T.TSC.T.$m2(N+v);A-=$.T.TSC.T.$m7(m,y,!0),m=y,o--,R=e.$m8(R)}else{var O=$.T.TSC.T.$m7(D,E,!0),b=$.T.TSC.T.$m7(E,m,!0);O<b?(H=O,g=D):(H=b,g=m);var I,p,Y=S.$f,P=Y.$m8(),X=$.T.TSC.T.$m2(h-d);if($.T.TSC.T.$m5(X,P,K+2*$.T.TSC.$f)){N=$.T.TSC.T.$m5(X,P,h)?P:h;Y.$f5=N-$.T.TSC.$f/2,Y.$f4=$.T.TSC.$f;var L=$.T.TSC.T.$m2(N-v);A-=$.T.TSC.T.$m7(L,h,!0),h=L,o--,S=e.$m7(S)}else{O=$.T.TSC.T.$m7(P,X,!0);var U=$.T.TSC.T.$m7(h,P,!0);if(O<U?(I=O,p=X):(I=U,p=h),H<I){w.$f5=g-$.T.TSC.$f/2,w.$f4=$.T.TSC.$f;y=$.T.TSC.T.$m2(g+v);A-=$.T.TSC.T.$m7(m,y,!0),m=y,o--,R=e.$m8(R)}else{Y.$f5=p-$.T.TSC.$f/2,Y.$f4=$.T.TSC.$f;L=$.T.TSC.T.$m2(p-v);A-=$.T.TSC.T.$m7(L,h,!0),h=L,o--,S=e.$m7(S)}}}}}function K(f,n,t){switch(t){case $.T.TSC.$f4:case 1:case $.T.TSC.$f6:case $.T.TSC.$f7:case $.T.TSC.$f5:return f.$f16[t];case 5:default:return n?f.$f16[$.T.TSC.$f7]:f.$f16[$.T.TSC.$f5]}}var N=f.lang.ClassDefinition,y=f.lang.InterfaceDefinition,O=(f.lang.AttributeDefinition,f.lang.EnumDefinition),b=(f.lang.StructDefinition,f.lang.Abstract),I=f.lang.module,p=(f.lang.delegate,f.lang.Boolean,f.lang.Number),Y=(f.lang.Object,f.lang.Void,f.lang.String,f.lang.decorators.Type),P=f.lang.decorators.OptionArgs,X=f.lang.decorators.SetterArg;f.lang.addMappings("yFiles-for-HTML-Complete-2.3.0.3-Evaluation (Build a8bb13db3ea7-12/28/2020)",{_$_dbd:["radius","$IH"],_$_lwd:["sectorSize","$mT"],_$_pae:["circleIndex","$OWG"],_$_qae:["sectorStart","$PWG"],_$_ffe:["centerOffset","$xZG"],_$_hfe:["edgeBundling","$zZG"],_$_ife:["layerSpacing","$AZG"],_$_bhf:["centerNodesDpKey","$tnG"],get _$_chf(){return["layeringStrategy","$uoG",Y("yfiles._R.C.RSC",5)]},_$_dhf:["minimumBendAngle","$voG"],get _$_zlf(){return["centerNodesPolicy","$bqG",Y("yfiles._R.C.QSC",5)]},_$_krf:["considerNodeLabels","$RtG"],get _$_xwf(){return["edgeRoutingStrategy","$KwG",Y("yfiles._R.C.SSC",5)]},_$_ebg:["minimumLayerDistance","$SyG"],_$_ylg:["maximumChildSectorAngle","$tDG"],_$_vqg:["minimumNodeToNodeDistance","$SGG"],_$_son:["CenterNodesPolicy","QSC"],_$_ton:["LayeringStrategy","RSC"],_$_uon:["EdgeRoutingStrategy","SSC"],get _$_von(){return["RadialLayout","TSC",P(X("minimumNodeToNodeDistance"),X("layerSpacing"),X("minimumLayerDistance"),X("maximumChildSectorAngle"),X("minimumBendAngle"),X("centerNodesPolicy","yfiles._R.C.QSC"),X("centerNodesDpKey"),X("layeringStrategy","yfiles._R.C.RSC"),X("edgeRoutingStrategy","yfiles._R.C.SSC"),X("considerNodeLabels"),X("orientationLayoutEnabled"),X("labeling"),X("selfLoopRouter"),X("parallelEdgeRouter"),X("componentLayout"),X("subgraphLayout"),X("hideGroupsStage"),X("orientationLayout"),X("layoutOrientation","yfiles._R.C.RHC"),X("selfLoopRouterEnabled"),X("labelingEnabled"),X("hideGroupsStageEnabled"),X("componentLayoutEnabled"),X("parallelEdgeRouterEnabled"),X("subgraphLayoutEnabled"))]},_$_won:["RadialLayoutNodeInfo","USC"],_$$_aua:["yfiles.radial","yfiles._R.T","yfiles._R.C"]});var L=["Minimal Bend Angle must not be bigger the 90","Minimal Bend Angle must be positive","y.layout.radial.EDGE_BUNDLING_DPKEY","No DataProvider holding EdgeBundling instance registered","y.layout.radial.bundles.PARENTS_DPKEY","Distance may not be negative","Spacing value may not be negative","Minimal layer distance may not be negative","Child sector size must be less or equal to 360 degrees","Child sector size may not be negative","Spacing must be greater than 0","Minimum Bend Angle must be less or equal to 90 degrees","Minimum Bend Angle must be positive","No valid center node policy","Invalid data provider key: ","Invalid layering strategy","Invalid edge routing strategy","User defined layering information not found!","NodeInfoDpKey","LayerIdDpKey"];I("_$$_aua",function(f){f._$_von=new N(function(){return{$extends:$.C.CKC,constructor:function(){$.C.CKC.call(this),this.$f6=$.T.GJC.AFFECTED_NODES_DP_KEY,this.$f4=new $.C.BHC(.95,.5),this.$LCG=!0,this.$KCG=!1,this.$f=new $.C.JOC,this.$f.$qxG=150,this.$f13=new $.NRA(this.$f.$nxG),this.$f.$nxG=this.$f13,this.$f16=[new $.URA,new $.MRA,new $.LRA,new $.TRA.$c(1),new $.TRA]},$f13:null,$f20:10,$f5:25,$f14:100,$f17:180,$f9:2,$f6:null,$f7:4,$f12:5,$f16:null,$f21:!1,$f:null,$f10:2,$f11:25,$f8:5,$f19:50,$f1:null,$f22:null,$f18:!1,$f4:null,$f3:null,$f2:null,$f15:!1,_$_vqg:{get:function(){return this.$f20},set:function(f){if(!(f>=0))throw $.IG.$m18(L[5]);this.$f20=f}},_$_ife:{get:function(){return this.$f5},set:function(f){if(!(f>=0))throw $.IG.$m18(L[6]);this.$f5=f}},_$_ebg:{get:function(){return this.$f14},set:function(f){if(!(f>=0))throw $.IG.$m18(L[7]);this.$f14=f}},_$_ylg:{get:function(){return this.$f17},set:function(f){if(f<0)throw $.IG.$m18(L[9]);if(f>360)throw $.IG.$m18(L[8]);this.$f17=f}},"$p!":{get:function(){return this.$f11},set:function(f){if(!(f>0))throw $.IG.$m18(L[10]);this.$f11=f}},_$_dhf:{get:function(){return this.$f8},set:function(f){if(f<0)throw $.IG.$m18(L[12]);if(f>90)throw $.IG.$m18(L[11]);this.$f8=f}},_$_zlf:{get:function(){return this.$f9},set:function(f){switch(f<<24>>24){case 0:case 1:case 2:case 3:this.$f9=f<<24>>24;break;default:throw $.IG.$m18(L[13])}}},_$_bhf:{get:function(){return this.$f6},set:function(f){if(null===f)throw $.IG.$m18(L[14]+null);this.$f6=f}},_$_chf:{get:function(){return this.$f7},set:function(f){switch(f<<24>>24){case 4:case 1:case 6:this.$f7=f<<24>>24;break;default:throw $.IG.$m18(L[15])}}},_$_xwf:{get:function(){return this.$f12},set:function(f){switch(f<<24>>24){case 1:case 5:this.$f12=f<<24>>24;break;default:throw $.IG.$m18(L[16])}}},_$_krf:{get:function(){return this.$f18},set:function($){this.$f18=$}},$DFG:{set:function($){this.$f43=$}},$bbH:function(f){if(!f.$mA){if(this.$uoG<<24>>24===6&&null===f.$hZH($.T.TSC.LAYER_ID_DP_KEY))throw $.IG.$m18(L[17]);var n=f.$hZH($.T.HLC.SOURCE_GROUP_ID_DP_KEY);f.$HeH($.T.HLC.SOURCE_GROUP_ID_DP_KEY);var t=f.$hZH($.T.HLC.TARGET_GROUP_ID_DP_KEY);f.$HeH($.T.HLC.TARGET_GROUP_ID_DP_KEY),this.$f15=function(f,n){var t=f.$hZH($.T.BHC.EDGE_BUNDLE_DESCRIPTOR_DP_KEY);if(null===t)return n.$jDG.$wK?f.$oN:0;for(var r=0,e=f.$gNG();e.$Ne;e.$wj()){var i=t.$Hk(e.$Ye);r=null!==i?i.$wK?r+1:r:n.$jDG.$wK?r+1:r}return r}(f,this.$f4)>1,this.$f3=$.T.WXA.$G();var r=null,e=null;this.$f15&&(e=f.$hZH($.ORA.$f3),f.$vpH($.ORA.$f3,$.T.TXA.$H(this.$zZG)),this.$OGG&&this.$BtG instanceof $.C.QKC&&(r=f.$hZH($.T.QKC.AFFECTED_EDGES_DP_KEY),function(f,n,t){for(var r=null!==t,e=n.$hZH($.T.BHC.EDGE_BUNDLE_DESCRIPTOR_DP_KEY),i=f.$f4.$jDG,a=$.T.WXA.$F(),u=n.$gNG();u.$Ne;u.$wj()){var o=u.$Ye,l=i;if(null!==e){var s=e.$Hk(o);null!==s&&(l=s)}l.$wK||(r?a.$NZ(o,t.$FZ(o)):a.$NZ(o,!0))}n.$vpH($.T.QKC.AFFECTED_EDGES_DP_KEY,a)}(this,f,r)));var i=f.$fNG();!function(f,n,t){if(_(f,n))for(var r=n.$hNG();r.$Ne;r.$wj()){var e=r.$Ze,i=$.T.DKC.$x(n,e);if(f.$f18)for(var a=n.$m41(e),u=0;u<a.length;u++)i=A(0,i,a[u].$Lh);t.$jp(e,n.$XSG(e)),G(e,i,n)}}(this,f,i);var a=null,u=this.$m2(f);u.$ULG()||(!function(f,n,t){if(f.$uoG<<24>>24===4)n.$vpH($.T.KNC.CORE_NODES_DP_KEY,new $.T.TSC.T2(t));else if(f.$uoG<<24>>24===6){f.$f22=n.$hZH($.T.HOC.LAYER_ID_DP_KEY);var r=n.$hZH($.T.TSC.LAYER_ID_DP_KEY);n.$vpH($.T.HOC.LAYER_ID_DP_KEY,r)}else{f.$f1=f.$f.$AlH(n);var e=n.$hZH($.T.GJC.NODE_ID_DP_KEY);if(null!==e){for(var i=null,a=new $.ME.$c1(t.$nX),u=$.KE.$m5(t);u.$p;){var o=u.$m(),l=e.$Hk(o);null!==l&&(null===i&&(i=l),a.$m(l))}for(var s=n.$hNG();s.$Ne;s.$wj()){var m=s.$Ze,h=e.$Hk(m);a.$zY(h)?f.$f1.$Qp(h):f.$f1.$os(h,i)}}}}(this,f,u),a=function(f,n){var t=new $.C.IVA.$u,r=f.$fNG();$.T.TUA.$x(f,n,r);for(var e=f.$gNG();e.$Ne;e.$wj()){var i=e.$Ye;r.$Nk(i.$f3)<r.$Nk(i.$f2)&&t.$m7(i)}for(e=t.$WKG();e.$Ne;e.$wj())f.$QVG(e.$Ye);return f.$fYH(r),t}(f,u)),this.$f.$eHG=this.$uoG<<24>>24;var o=f.$hZH($.T.JOC.SUB_COMPONENT_ID_DP_KEY);if(null!==o&&f.$HeH($.T.JOC.SUB_COMPONENT_ID_DP_KEY),this.$f.$El(f),null!==o&&f.$vpH($.T.JOC.SUB_COMPONENT_ID_DP_KEY,o),S(this,f,this.$f13.$f),null!==a)for(;!a.$ULG();){var l=a.$PLG();$.T.YJC.$E(f.$DUG(l)),f.$QVG(l)}if(this.$uoG<<24>>24===4?f.$HeH($.T.KNC.CORE_NODES_DP_KEY):this.$uoG<<24>>24===6&&(null!==this.$f22?(f.$vpH($.T.HOC.LAYER_ID_DP_KEY,this.$f22),this.$f22=null):f.$HeH($.T.HOC.LAYER_ID_DP_KEY)),null!==this.$f1&&(this.$f1.$Tj(),this.$f1=null),this.$f13.$m(),function($,f,n){if(_($,f))for(var t=f.$hNG();t.$Ne;t.$wj()){var r=t.$Ze,e=f.$BUG(r);f.$gmH(r,n.$Hk(r)),f.$EnH(r,e)}}(this,f,i),f.$fYH(i),this.$f15){for(var s=f.$hZH($.T.BHC.EDGE_BUNDLE_DESCRIPTOR_DP_KEY),m=new $.C.VXA(f),h=f.$gNG();h.$Ne;h.$wj()){C(this,l=h.$Ye,s).$wK||m.$vRG(l)}(new $.ORA).$El(f),m.$DMG(),f.$fYH(this.$f2),f.$HeH($.T.TSC.$f2)}null!==n&&(f.$vpH($.T.HLC.SOURCE_GROUP_ID_DP_KEY,n),n=null),null!==t&&(f.$vpH($.T.HLC.TARGET_GROUP_ID_DP_KEY,t),t=null),this.$f15&&(f.$HeH($.ORA.$f3),this.$OGG&&this.$BtG instanceof $.C.QKC&&f.$HeH($.T.QKC.AFFECTED_EDGES_DP_KEY)),null!==e&&f.$vpH($.ORA.$f3,e),null!==r&&f.$vpH($.T.QKC.AFFECTED_EDGES_DP_KEY,r)}},"$m2!":function(f){if(this.$uoG<<24>>24===6)return function(f,n){for(var t=n.$hZH($.T.TSC.LAYER_ID_DP_KEY),r=$.RG.$f4,e=new $.C.EXA.$u,i=n.$hNG();i.$Ne;i.$wj()){var a=i.$Ze,u=t.$Nk(a);u<r?(e.$Hd(),e.$m5(a),r=u):u===r&&e.$m5(a)}return e}(0,f);var n=new $.C.EXA.$u;if(3===this.$f9){var t=f.$hZH(this.$tnG);if(null!==t)for(var r=f.$hNG();r.$Ne;r.$wj())t.$FZ(r.$Ze)&&n.$m5(r.$Ze);if(!n.$ULG())return n}var e=$.T.LWA.$E(f,this.$f3);if(e>1){for(var i=new $.C.UXA(f,this.$f3),a=0;a<e;a++)i.$jbH(a),n.$m5(R(this,f));i.$BMG()}else n.$m5(R(this,f));return n},"$m12!":function($,f){var n=$.$NTG(f),t=$.$CUG(f),r=1;return(n>0||t>0)&&(r=Math.sqrt(n*n+t*t)),r+=this.$SGG},_$_hfe:{get:function(){return this.$f4}},$static:{NODE_INFO_DP_KEY:null,LAYER_ID_DP_KEY:null,$f4:0,$f6:2,$f7:3,$f5:4,$f:1e-4,$f1:2*Math.PI,$f3:50,$f2:L[4],T2:new N(function(){return{$extends:$.C.SXA,$final:!0,constructor:function(f){$.C.SXA.call(this),this.$f=f},"$FZ!":function($){return this.$f.$zY($)},$f:null}}),T3:new N(function(){return{$final:!0,$with:[$.C.QYA],constructor:function(){},"$Qd!":function($,f){var n=f,t=$.$f2-n.$f2;return t<0?-1:t>0?1:0}}}),T1:new N(function(){return{$final:!0,$with:[$.C.QYA],constructor:function(){},"$Qd!":function($,f){var n=f,t=$.$f9-n.$f9;return t>0?-1:t<0?1:0}}}),T:new N(function(){return{$final:!0,constructor:function($,f){this.$f1=$,this.$f=f},$f1:0,$f:0,"$m!":function(f){return $.T.TSC.T.$m3(this.$f,f.$f)},$static:{"$m7!":function(f,n,t){var r=n-f;return t&&r<0?r+=$.T.TSC.$f1:!t&&r>0&&(r-=$.T.TSC.$f1),r},"$m3!":function($,f){var n=f-$;return 0<=n&&n<=Math.PI||n<0&&n<-Math.PI},"$m6!":function(f,n,t){return $.T.TSC.T.$m5(f.$f,n.$f,t.$f)},"$m5!":function($,f,n){return $<=f&&f<=n||n<$&&($<f||f<n)},"$m4!":function(f,n,t){var r=(f.$f1+n.$f1)/2,e=$.T.TSC.T.$m7(f.$f,n.$f,t),i=$.T.TSC.T.$m2(f.$f+e/2);return new $.T.TSC.T(r,i)},"$m2!":function(f){return f<0?f+=$.T.TSC.$f1:f>=$.T.TSC.$f1&&(f-=$.T.TSC.$f1),f},"$m1!":function(f,n){var t=Math.sin(n)*f,r=Math.cos(n)*f;return new $.C.FWA.$v(t,r)},"$m!":function(f,n){var t=Math.atan2(n,f),r=f*f+n*n,e=r>0?Math.sqrt(r):0;return new $.T.TSC.T(e,t)}}}}),$clinit:function(){$.T.TSC.NODE_INFO_DP_KEY=new $.C.GVA($.C.USC.$class,$.C.TSC.$class,L[18]),$.T.TSC.LAYER_ID_DP_KEY=new $.C.GVA(p.$class,$.C.TSC.$class,L[19])}}}})}),I("_$$_aua",function($){$._$_son=new O(function(){return{DIRECTED:0,CENTRALITY:1,WEIGHTED_CENTRALITY:2,CUSTOM:3}})}),I("_$$_aua",function($){$._$_ton=new O(function(){return{BFS:4,HIERARCHICAL:1,USER_DEFINED:6}})}),I("_$$_aua",function($){$._$_uon=new O(function(){return{POLYLINE:1,ARC:5}})}),I("_$$_aua",function($){$._$_won=new N(function(){return{constructor:function(){},$f2:0,$f:0,$f4:null,$f3:0,$f1:0,_$_pae:{get:function(){return this.$f2}},_$_dbd:{get:function(){return this.$f}},_$_ffe:{get:function(){return this.$f4}},_$_qae:{get:function(){return this.$f3}},_$_lwd:{get:function(){return this.$f1}}}})}),I("yfiles._R",function(f){f.HRA=new N(function(){return{$abstract:!0,$with:[$.KRA],constructor:function(){this.$f3=Math.cos(this.$f*Math.PI/180)},$f6:!0,$f5:!1,$f2:25,$f:5,$f3:0,"$p!":{get:function(){return this.$f},set:function(f){if(f<0)throw $.IG.$m18(L[1]);if(f>90)throw $.IG.$m18(L[0]);this.$f=f,this.$f3=Math.cos(this.$f*Math.PI/180)}},"$m6!":function(f,n){for(var t=new $.C.XXA.$u,r=null,e=$.KE.$m5(f);e.$p;){var i=e.$m(),a=i.$f1,u=n[a].$m1(),o=i.$m5(),l=this.$f5?n[a].$m4():0;if(null!==r){if(this.$f5&&(!this.$f6||r.$f1>0)&&Math.abs(o-r.$m5())>$.T.TSC.$f){var s=n[r.$f1].$m1(),m=n[r.$f1].$m4(),h=r.$f1>a?s-m:s+m;t.$m5(new $.T.TSC.T(h,r.$m5()))}var c=r.$f1===a;if(c){var T;if(a+1<n.length){var v=this.$f5?n[a+1].$m4():0;T=(u+l+n[a+1].$m1()-v)/2}else{m=this.$f5?n[a-1].$m4():0;T=u+l+(u-l-((s=n[a-1].$m1())+m))/2}var C=r.$m5(),_=$.T.TSC.T.$m3(C,o),G=$.T.TSC.T.$m7(C,o,_)/2,A=$.T.TSC.T.$m2(C+G);t.$m5(new $.T.TSC.T(T,A))}if(this.$f5&&Math.abs(o-r.$m5())>$.T.TSC.$f)if(c)t.$m5(new $.T.TSC.T(u+l,o));else if(!this.$f6||r.$f1>0&&a>0){h=r.$f1<a?u-l:u+l;t.$m5(new $.T.TSC.T(h,o))}}t.$m5(new $.T.TSC.T(u,o)),r=i}if(t.$f1>2){var R=t.$f2,S=R.$f.$f,w=R.$f.$f1,E=R.$HKG();C=E.$f.$f;0===w&&(S=C);for(var H=E.$HKG();null!==H;H=H.$HKG()){o=H.$f.$f;Math.abs(S-C)<$.T.TSC.$f&&Math.abs(C-o)<$.T.TSC.$f?t.$aUG(E):S=C,E=H,C=o}}return t},"$m5!":function($){if($.$f1>2)for(var f=$.$f2,n=f.$f,t=f.$HKG(),r=t.$f,e=n.$f-r.$f,i=n.$f1-r.$f1,a=t.$HKG();null!==a;a=a.$HKG()){var u=a.$f,o=r.$f-u.$f,l=r.$f1-u.$f1;(o*e+l*i)/(Math.sqrt(o*o+l*l)*Math.sqrt(e*e+i*i))>this.$f3?($.$aUG(t),e=n.$f-u.$f,i=n.$f1-u.$f1):(n=r,e=o,i=l),t=a,r=u}},$m:b}})}),I("yfiles._R",function(f){f.SRA=new N(function(){return{$extends:$.RRA,$final:!0,constructor:function(f,n,t){$.RRA.call(this,n,f),this.$f6=t},$f6:null,"$m4!":function(){return this.$f6}}})}),I("yfiles._R",function(f){f.RRA=new N(function(){return{constructor:function($,f){this.$f2=$,this.$f1=f},$f:0,$f5:0,$f4:0,$f7:0,$f9:0,$f8:0,$f1:0,$f2:0,$f3:null,$f11:null,$f12:null,"$m5!":function(){return this.$f5+this.$f4/2},"$m7!":function(){this.$f5=0,this.$f4=0,this.$f9=0,this.$f8=0,this.$f7=0},"$m2!":function(f){null===this.$f11&&(this.$f11=new $.C.XXA.$u),this.$f11.$m5(f)},"$m3!":function(f){null===this.$f12&&(this.$f12=new $.C.XXA.$u),this.$f12.$m5(f)},"$m!":function(){return null!==this.$f11&&!this.$f11.$ULG()},"$m1!":function(){null!==this.$f11&&this.$f11.$zRG(new $.RRA.T)},$static:{T:new N(function(){return{$final:!0,$with:[$.C.QYA],constructor:function(){},"$Qd!":function($,f){var n=f,t=$.$f2-n.$f2;return t<0?-1:t>0?1:0}}})}}})}),I("yfiles._R",function(f){f.QRA=new N(function(){return{$extends:$.RRA,$final:!0,constructor:function(f,n,t){$.RRA.call(this,n,f),this.$f6=t},$f6:null,$f10:0,"$m6!":function(){return this.$f6},"$m8!":function(){return this.$f10},"$m4!":function(f){var n=f[this.$f1].$m1(),t=this.$f3.$m5(),r=f[this.$f3.$f1].$m1(),e=this;do{e=null!==e.$f12?e.$f12.$Da:e.$f11.$Da}while(0===e.$f4);var i=e.$m5(),a=f[e.$f1].$m1(),u=$.T.TSC.T.$m3(t,i),o=$.T.TSC.T.$m7(t,i,u),l=(n-r)/(a-r);this.$f10=$.T.TSC.T.$m2(t+l*o)}}})}),I("yfiles._R",function(f){f.PRA=new N(function(){return{$extends:$.RRA,$final:!0,constructor:function(){$.RRA.call(this,0,0)}}})}),I("yfiles._R",function(f){f.NRA=new N(function(){return{$final:!0,$with:[$.C.ZOC],constructor:function($){this.$f1=$},$f1:null,$f:null,"$m!":function(){this.$f=null},"$Su!":function(f,n,t,r){this.$f1.$Su(f,n,t,r),0===n.$Aj()?this.$f=[]:this.$f=function(f,n){var t,r=function($){for(var f=0,n=0;n<$.$Aj();n++){var t=$.$dk(n);t.$me<<24>>24!==2&&t.$me<<24>>24!==3&&f++}return f}(f),e=0;1===function($,f){var n;n=0;for(var t=$.$dk(0).$le.$f2;null!==t;t=t.$HKG()){var r=t.$f,e=f.$Dl(r);e.$ne<<24>>24===0&&n++}return n}(f,n)?t=$.DF.$m11(r):(t=$.DF.$m11(r+1),(u=new $.JRA(0)).$m5(new $.PRA),t[0]=u,e=1);for(var i=0;i<f.$Aj();i++){var a=f.$dk(i);if(a.$me<<24>>24!==2&&a.$me<<24>>24!==3){var u=new $.JRA(e);t[e]=u;for(var o=0,l=a.$le.$f2;null!==l;l=l.$HKG()){var s=l.$f,m=n.$Dl(s);if(m.$ne<<24>>24===0){var h=new $.SRA(e,o++,s);u.$m5(h)}else if(m.$ne<<24>>24===1){var c=new $.QRA(e,o++,m.$oh);u.$m5(c)}}e++}}return t}(n,t)}}})}),I("yfiles._R",function(f){f.TRA=new N(function(){return{$extends:$.IRA,$final:!0,constructor:{default:function(){$.IRA.call(this)},$c:function(f){$.IRA.call(this),this.$f1=!1,this.$f4=f}},$f1:!0,$f4:.5,"$m1!":function(){return this.$f1},"$m3!":function($){this.$f1=$},"$m2!":function(){return this.$f4},"$m4!":function($){this.$f4=$},"$m7!":function(f,n,t,r,e){var i=n.$m(t),a=t.$f1-n.$f1,u=$.T.TSC.T.$m7(n.$f,t.$f,i);if(!(Math.abs(u)<$.T.TSC.$f)){var o,l,s,m,h=Math.abs(a)+(n.$f1+a/2)*Math.abs(u),c=Math.max(1,$.VE.$m6(Math.floor(h/this.$f2))),T=0;if(r!==e)o=1/(c+1),l=r?0:c,s=r?c:0,T=r?1:0,m=this.$f1?.5-Math.min(2*Math.abs(u)/Math.PI,.5):1-this.$f4;else if(o=2/(c+1),s=c-(l=c/2|0),a/=2,u/=2,this.$f1)if(0===a)m=1-Math.min(1.5*Math.abs(u)/Math.PI,1);else if(0===u)m=1;else{var v=(n.$f1+a/2)*u;m=Math.min(1,Math.abs(a/v*$.TRA.$f*Math.PI/u))}else m=1-this.$f4;for(var C=0;C<l;C++){var _=(T+=o)*Math.PI/2,G=1-(m*(1-T)+(1-m)*Math.cos(_)),A=m*T+(1-m)*Math.sin(_);r?(w=G,E=A):(w=A,E=G);var R=n.$f1+w*a,S=n.$f+E*u;f.$m5($.T.TSC.T.$m1(R,S))}T=2-T;for(C=0;C<s;C++){var w,E;_=(T-=o)*Math.PI/2,G=1-(m*(1-T)+(1-m)*Math.cos(_)),A=m*T+(1-m)*Math.sin(_);e?(w=G,E=A):(w=A,E=G);R=t.$f1-w*a,S=t.$f-E*u;f.$m5($.T.TSC.T.$m1(R,S))}}},$static:{$f:.125}}})}),I("yfiles._R",function(f){f.MRA=new N(function(){return{$extends:$.HRA,$final:!0,constructor:function(){$.HRA.call(this)},"$m!":function(f,n){if(f.$nX<3)return $.JE.$f1;var t=$.MRA.$super.$m6.call(this,f,n);if(t.$f1<3)return $.JE.$f1;var r=new $.C.XXA.$u,e=t.$m3();e.$m();for(var i=0;i<t.$f1-2;i++){var a=e.$m();r.$m5($.T.TSC.T.$m1(a.$f1,a.$f))}return this.$m5(r),r}}})}),I("yfiles._R",function(f){f.LRA=new N(function(){return{$extends:$.IRA,$final:!0,constructor:function(){$.IRA.call(this)},"$m7!":function(f,n,t,r,e){var i=n.$m(t),a=t.$f1-n.$f1,u=$.T.TSC.T.$m7(n.$f,t.$f,i);if(!(Math.abs(u)<$.T.TSC.$f))for(var o=Math.abs(a)+(n.$f1+a/2)*Math.abs(u),l=Math.max(1,$.VE.$m6(Math.floor(o/this.$f2))),s=a/(l+1),m=u/(l+1),h=n.$f1,c=n.$f,T=0;T<l;T++)h+=s,c+=m,f.$m5($.T.TSC.T.$m1(h,c))}}})}),I("yfiles._R",function($){$.KRA=new y(function(){return{$m:b}})}),I("yfiles._R",function(f){f.JRA=new N(function(){return{$final:!0,constructor:function(f){this.$f=f,this.$f1=new $.C.XXA.$u},$f:0,$f2:0,$f3:0,$f1:null,"$m!":function(){return this.$f},"$m1!":function(){return this.$f2},"$m6!":function($){this.$f2=$},"$m4!":function(){return this.$f3},"$m9!":function($){this.$f3=$},"$m3!":function(){return this.$f1.$f2},"$m2!":function(){return this.$f1.$f},"$m8!":function($){return null!==$.$HKG()?$.$HKG():this.$f1.$f2},"$m7!":function($){return null!==$.$GKG()?$.$GKG():this.$f1.$f},"$m5!":function($){this.$f1.$m5($)}}})}),I("yfiles._R",function(f){f.IRA=new N(function(){return{$extends:$.HRA,$abstract:!0,constructor:function(){$.HRA.call(this)},"$m!":function(f,n){for(var t=this.$m6(f,n),r=new $.C.XXA.$u,e=null,i=null,a=t.$f2;null!==a;a=a.$HKG()){var u=a.$f;if(null!==i){var o=!0;null!==e&&(o=e.$f1<i.$f1);var l=i.$f1<u.$f1,s=!1;if(null!==a.$HKG()){var m=a.$HKG().$f;s=l!==u.$f1<m.$f1}(!this.$f6||0!==i.$f1&&0!==u.$f1)&&(null!==e&&r.$m5($.T.TSC.T.$m1(i.$f1,i.$f)),this.$m7(r,i,u,o!==l,s))}e=i,i=u}return this.$m5(r),r},$m7:b}})}),I("yfiles._R",function(f){f.ORA=new N(function(){return{$final:!0,$with:[$.C.FJC],constructor:function(){},$f2:null,$f1:null,$f:null,$f3:null,$f4:null,"$El!":function(f){this.$f1=f;var n=this.$f1.$hZH($.ORA.$f3);if(null===n||!(n.$Hk(f)instanceof $.C.BHC))throw $.IG.$m28(L[3]);this.$f3=n.$Hk(f),this.$f2=f.$fNG();var t=new $.C.VXA(f);!function(f){for(var n=f.$f1.$hNG();n.$Ne;n.$wj()){var t=new $.ORA.T(f,$.ORA.T.$f1);f.$f2.$jp(n.$Ze,t)}}(this),function(f){for(var n=f.$f1.$hZH($.T.TSC.$f2),t=f.$f1.$hNG();t.$Ne;t.$wj()){var r=t.$Ze;T(f,r).$m9(n.$Hk(r))}}(this),function(f){f.$f4=new $.C.EXA.$u;for(var n=f.$f1.$LNG(),t=0;t<n.length;t++){var r=n[t],e=f.$f1.$vVG(r),i=f.$f1.$wVG(r),a=T(f,r);if(null!==a.$m()){var u=f.$f1.$UMG(),o=f.$f1.$UMG(),l=f.$f1.$UMG();f.$f4.$m5(u),f.$f4.$m5(o),f.$f4.$m5(l);var s=new $.ORA.T(f,$.ORA.T.$f);s.$m14(o),s.$m16(l),s.$m15(r),a.$m15(u);var m=new $.ORA.T(f,$.ORA.T.$f);m.$m14(u),m.$m16(l),m.$m15(r);var h=new $.ORA.T(f,$.ORA.T.$f);h.$m14(l),h.$m16(l),h.$m15(r),v(f,u,s),v(f,o,m),v(f,l,h),f.$f1.$EnH(l,new $.C.FWA.$v(e,i)),f.$f1.$EnH(u,new $.C.FWA.$v(e-5,i-5)),f.$f1.$EnH(o,new $.C.FWA.$v(e+5,i+5))}else{f.$f=f.$f1.$UMG(),f.$f4.$m5(f.$f);var c=new $.ORA.T(f,$.ORA.T.$f);c.$m14(f.$f),c.$m16(f.$f),c.$m15(r),a.$m15(f.$f),v(f,f.$f,c),f.$f1.$EnH(f.$f,new $.C.FWA.$v(e,i))}}}(this),function($){for(var f=$.$f1.$hNG();f.$Ne;f.$wj()){var n=f.$Ze;if(!c($,n)){var t=T($,n),r=t.$m();if(null!==r){var e=T($,r).$m7(),i=T($,e).$m6(),a=T($,e).$m8(),u=t.$m7(),o=T($,u),l=o.$m6(),s=o.$m8();o.$m11(e),T($,l).$m12(i),T($,s).$m13(a),$.$f1.$PnH(u,e),$.$f1.$PnH(i,l),$.$f1.$PnH(s,a)}}}}(this),t.$DMG(),function(f,n,t){for(var r=t.$WKG();r.$Ne;r.$wj()){var i=r.$Ye,a=h(f,n,i),u=n.$DUG(i);u.$ij(),n.$zqH(i,new $.C.FWA.$v(0,0)),n.$BqH(i,new $.C.FWA.$v(0,0));for(var l=e(o(f,i,f.$f3.$RnG,a.$opG)),s=1;s<l.$nX-1;s++){var m=l.$qX(s);u.$Lq(m.$f,m.$f1)}}}(this,f,function(f){for(var n=new $.C.IVA.$u,t=f.$f1.$gNG();t.$Ne;t.$wj()){var e=t.$Ye;r(f,e)||n.$m5(e)}return n}(this)),function($){for(var f=0;f<$.$f4.$f1;f++)$.$f1.$VUG($.$f4.$qX(f))}(this),function(f,n,t,r){var e=new $.C.VGC(null);e.$NYG=r;for(var i=e.$asG,a=$.T.WXA.$F(),u=!1;t.$Ne;t.$wj()){var o=t.$Ye;h(f,n,o).$edG&&(a.$NZ(o,!0),u=!0)}u&&(n.$vpH(i,a),e.$El(n),n.$HeH(i))}(this,this.$f1,f.$gNG(),4),f.$fYH(this.$f2)},$static:{$f:0,$f1:1,$f2:2,$f3:L[2],T:new N(function(){return{$final:!0,constructor:function($,f){this.$f5=$,this.$f3=f},$f3:0,$f1:0,$f8:null,$f7:null,$f9:null,$f2:null,$f4:null,$f6:null,$f:null,"$m6!":function(){return this.$f7},"$m14!":function($){this.$f7=$},"$m16!":function($){this.$f9=$},"$m8!":function(){return this.$f9},"$m5!":function(){return this.$f6},"$m13!":function($){this.$f6=$},"$m4!":function(){return this.$f4},"$m12!":function($){this.$f4=$},"$m2!":function(){return this.$f2},"$m11!":function($){this.$f2=$},"$m!":function(){return this.$f},"$m9!":function($){this.$f=$},"$m7!":function(){return this.$f8},"$m15!":function($){this.$f8=$},"$m1!":function(){return this.$f1},"$m10!":function($){this.$f1=$},"$m3!":function(){return this.$f3},$f5:null,$static:{$f:0,$f1:1}}})}}})}),I("yfiles._R",function(f){f.URA=new N(function(){return{$final:!0,$with:[$.KRA],"$m!":function(f,n){return $.JE.$f1}}})})}(f.lang.module("yfiles._R"),f),f},"function"==typeof define&&define.amd?define(["./lang","./core-lib","./algorithms","./layout-core","./layout-hierarchic"],f):"object"==typeof exports&&"undefined"!=typeof module&&"object"==typeof module.exports?module.exports=f(require("./lang"),require("./core-lib"),require("./algorithms"),require("./layout-core"),require("./layout-hierarchic")):f($.yfiles.lang,$.yfiles)}("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this);
