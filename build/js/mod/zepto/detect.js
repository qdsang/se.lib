/*! Copyright (c) SESHENGHUO.COM - Author: LIJUN - Email: zwlijun@gmail.com - Git: https://github.com/zwlijun/se.lib */
!function(a){function b(a){var b=this.os={},c=this.browser={},d=a.match(/Web[kK]it[\/]{0,1}([\d.]+)/),e=a.match(/(Android);?[\s\/]+([\d.]+)?/),f=!!a.match(/\(Macintosh\; Intel /),g=a.match(/(iPad).*OS\s([\d_]+)/),h=a.match(/(iPod)(.*OS\s([\d_]+))?/),i=!g&&a.match(/(iPhone\sOS)\s([\d_]+)/),j=a.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),k=a.match(/Windows Phone ([\d.]+)/),l=j&&a.match(/TouchPad/),m=a.match(/Kindle\/([\d.]+)/),n=a.match(/Silk\/([\d._]+)/),o=a.match(/(BlackBerry).*Version\/([\d.]+)/),p=a.match(/(BB10).*Version\/([\d.]+)/),q=a.match(/(RIM\sTablet\sOS)\s([\d.]+)/),r=a.match(/PlayBook/),s=a.match(/Chrome\/([\d.]+)/)||a.match(/CriOS\/([\d.]+)/),t=a.match(/Firefox\/([\d.]+)/),u=a.match(/MSIE\s([\d.]+)/)||a.match(/Trident\/[\d](?=[^\?]+).*rv:([0-9.].)/),v=!s&&a.match(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/),w=v||a.match(/Version\/([\d.]+)([^S](Safari)|[^M]*(Mobile)[^S]*(Safari))/);(c.webkit=!!d)&&(c.version=d[1]),e&&(b.android=!0,b.version=e[2]),i&&!h&&(b.ios=b.iphone=!0,b.version=i[2].replace(/_/g,".")),g&&(b.ios=b.ipad=!0,b.version=g[2].replace(/_/g,".")),h&&(b.ios=b.ipod=!0,b.version=h[3]?h[3].replace(/_/g,"."):null),k&&(b.wp=!0,b.version=k[1]),j&&(b.webos=!0,b.version=j[2]),l&&(b.touchpad=!0),o&&(b.blackberry=!0,b.version=o[2]),p&&(b.bb10=!0,b.version=p[2]),q&&(b.rimtabletos=!0,b.version=q[2]),r&&(c.playbook=!0),m&&(b.kindle=!0,b.version=m[1]),n&&(c.silk=!0,c.version=n[1]),!n&&b.android&&a.match(/Kindle Fire/)&&(c.silk=!0),s&&(c.chrome=!0,c.version=s[1]),t&&(c.firefox=!0,c.version=t[1]),u&&(c.ie=!0,c.version=u[1]),w&&(f||b.ios)&&(c.safari=!0,f&&(c.version=w[1])),v&&(c.webview=!0),b.tablet=!!(g||r||e&&!a.match(/Mobile/)||t&&a.match(/Tablet/)||u&&!a.match(/Phone/)&&a.match(/Touch/)),b.phone=!(b.tablet||b.ipod||!(e||i||j||o||p||s&&a.match(/Android/)||s&&a.match(/CriOS\/([\d.]+)/)||t&&a.match(/Mobile/)||u&&a.match(/Touch/)))}b.call(a,navigator.userAgent),a.__detect=b}(Zepto);