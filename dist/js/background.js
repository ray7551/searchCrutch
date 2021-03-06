webpackJsonp([4],{

/***/ "/FMp":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _config = __webpack_require__("wYMm");

var _config2 = _interopRequireDefault(_config);

var _base = __webpack_require__("5a/Z");

var _Engine = __webpack_require__("gLfi");

var _Engine2 = _interopRequireDefault(_Engine);

var _EngineType = __webpack_require__("Tsvq");

var _EngineType2 = _interopRequireDefault(_EngineType);

var _Setting = __webpack_require__("mzR8");

var _Setting2 = _interopRequireDefault(_Setting);

var _Icon = __webpack_require__("sInu");

var _Icon2 = _interopRequireDefault(_Icon);

var _Url = __webpack_require__("tDBr");

var _Url2 = _interopRequireDefault(_Url);

var _iconData = __webpack_require__("5mzi");

var _iconData2 = _interopRequireDefault(_iconData);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let bgWarn = (0, _base.minErr)('Background Warning');
let Listener = function () {

  function removeRedirect(tab) {
    const { url, id } = tab;
    let tabUrl = new _Url2.default(url);
    if (!tabUrl.isNormal || !Number.isInteger(id)) {
      return;
    }

    return Promise.all([_Setting2.default.get('cfg_remove_redirect'), _Engine2.default.get('google')]).spread(function (removeRedirect, engine) {
      if (!removeRedirect) {
        return;
      }

      if (!engine.hosts.includes(tabUrl.host.toLowerCase()) || !tabUrl.includes('url?') && !tabUrl.includes('imgres?')) {
        // clog('Not a valid google redirect url', tabUrl);
        return;
      }

      let originUrl = tabUrl.getQueryVal('url');
      let originImgUrl = tabUrl.getQueryVal('imgrefurl');
      // google's interstitial page will warn people 'This site may harm your computer'
      // so keep it as it is
      // if(/^\/interstitial\?url=/.test(originUrl)) {
      //   let tempUrl = new Url('http://google.com' + originUrl);
      //   originUrl = decodeURIComponent(tempUrl.getQueryVal('url'));
      // }
      if (_Url2.default.isNormal(originUrl)) {
        _base.clog.info('█████Remove redirection: ', url, ' to ', originUrl);
        chrome.tabs.update(id, { url: originUrl });
      } else if (_Url2.default.isNormal(originImgUrl)) {
        _base.clog.info('█████Remove redirection: ', url, ' to ', originImgUrl);
        chrome.tabs.update(id, { url: originImgUrl });
      }
    }).catch(function (error) {
      throw new Error('Error in remove redirect: ' + error);
    });
  }

  function loadInitData() {
    let manifest = chrome.runtime.getManifest();
    let loadDataPromises = [];
    loadDataPromises.push(_Setting2.default.set('version', manifest.version));

    _iconData2.default.forEach(group => {
      group.hosts.forEach(host => {
        loadDataPromises.push(_Icon2.default.set(host, group.dataURI));
      });
    });

    Object.keys(_config2.default.engineTypes).forEach(function (typeId) {
      loadDataPromises.push(_EngineType2.default.set(typeId, _config2.default.engineTypes[typeId]));
    });

    Object.keys(_config2.default.engines).forEach(function (key) {
      loadDataPromises.push(_Engine2.default.set(key, _config2.default.engines[key]));
    });

    loadDataPromises.push(_Setting2.default.set('cfg_remove_redirect', true));
    if (_config2.default.devMode) {
      // Promise.all(loadDataPromises).then(() => {
      //   clog('load init data done!');
      //   chrome.tabs.create({url: 'chrome-extension://' + chrome.runtime.id + '/popup.html'});
      // }).catch(e => clog('load init data error', e.toString()));
    }
  }

  return {
    onTabCreated: function (tabInfo) {
      // chrome.tabs.onCreated listener may not get tab url properly,
      // but it takes shorter time compare to chrome.tabs.onUpdated
      if (!tabInfo.url || !/^https?/.test(tabInfo.url)) {
        return;
      }
      removeRedirect(tabInfo);
    },

    onTabUpdated: function (tabId, changeInfo, tab) {
      if (!changeInfo.status || 'loading' !== changeInfo.status || !tab.url || !/^https?/.test(tab.url)) {
        return;
      }
      removeRedirect(tab);

      let tabUrl = new _Url2.default(tab.url);
      let faviconUrl = new _Url2.default(tab.favIconUrl);
      _Engine2.default.searchKeys(tabUrl.host).then(function (keys) {
        if (!keys.length) {
          throw new bgWarn('onTabUpdated: Not found engine for host: {0}', tabUrl.host);
        }
        chrome.browserAction.setTitle({ title: '点击切换搜索引擎', tabId: tabId });
        if (!faviconUrl.isNormal && !faviconUrl.isDataURI) {
          throw new bgWarn('onTabUpdated: Not found valid favIconUrl: {0}', tab.favIconUrl);
        }
        return _Icon2.default.get(tabUrl.host);
      }).then(function (iconUrl) {
        if (_Url2.default.isDataURI(iconUrl)) {
          throw new bgWarn('onTabUpdated: No need to update favicon url.');
        }
        return _Url2.default.toDataURI(tab.favIconUrl);
      }).then(function (dataURI) {
        (0, _base.clog)('Update favicon of:', tabUrl.host, dataURI);
        return _Icon2.default.set(tabUrl.host, dataURI);
      }).catch(bgWarn, function (e) {
        // ignore
        (0, _base.clog)(e.toString());
      });
    },

    onInstalled: function () {
      (0, _base.clog)('installed');
      if (_config2.default.devMode) {
        _Icon2.default.clear();
        _Setting2.default.clear();
        _Engine2.default.clear();
        _EngineType2.default.clear();
        loadInitData();
      }
    },

    onStartup() {
      (0, _base.clog)('startup');
      loadInitData();
    }
  };
}();

chrome.runtime.onInstalled.addListener(Listener.onInstalled);
chrome.runtime.onStartup.addListener(Listener.onStartup);

chrome.tabs.onCreated.addListener(Listener.onTabCreated);
// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(Listener.onTabUpdated);

/***/ }),

/***/ "5mzi":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
const iconData = [{
  hosts: ['default.icon', 'htmlpreview.github.io', 'www.zimuku.net'],
  dataURI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAMklEQVR4AWMgEkT9R4INWBUgKX0Q1YBXQYQCkhKEMDILogSnAhhEV4AGRqoCTEhkPAMAbO9DU+cdCDkAAAAASUVORK5CYII='
}, {
  hosts: ['weixin.sogou.com'],
  dataURI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA60lEQVR4AayQJVBFYRBG9y49YI0+g3vCabjT0J5exUmvIRkn4Y1Ewd2lBxIuBYeDP/czc/bbK7+KvxhiQdlikhL5WI3pGCEAp7iE4zg7k7HzZjcBg+OIIUwU1+xjI5PsCOjP4Fxixe1ggHhc+BkjBk0YeYLh4h3nGKUUk+VgtmZ8KpY4fh+OJqVUiu+Ufh7hhSZIfONRKVfiOxdKmRPfWVBKN76K97xir3KzGzRm8R4zY9dUgKaZ6BfPeMa2nzGiAmDZH+O92HOPo5jC4E7LQZbk8DGGDMFUrMACTMQQvtXigQSSDwAAAP//AwC16EMX3j4wHAAAAABJRU5ErkJggg=='
}, {
  hosts: ['s.taobao.com'],
  dataURI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA9UlEQVR4AZSTIUgGQRCF38rfLVcFe9GgNu2I9exBEAWv2oPBavAU7OXqaUejxZ4Eo9eL4sg+eLA8cWE/GG7Y2fdmZ9lLABAvU+B5QhMHPdJ+nyiOq+MIcbZV5v/G59F6sDHFFP0EudgJ4rl4vOO6TFYQwx7IzSvwdA8cnoL5sAuhOplHZFZekIAG5brVZLCGv3hn5jkMMzjf5tHVUV/lDEcjOOrmY9VPoNnyZusms7rB7RtEXewjuPj7q7wL3U/ZJNfNwDfOI0NIKHFZS/k5Ltcn6DY20cLy8Y7u8gEJAGSSkVHeUIFi/kyO3jhacAM08CuAAAMAbJW62Yvw6tMAAAAASUVORK5CYII='
}, {
  hosts: ['www.baidu.com'],
  dataURI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABdklEQVR4AayTU2AjURSG/zhr27Zt27Zt27Ztm++rp7Vr24iNwZ26jZNveHV8eM3ax9LwBiLAU8hZPmzw/pMObbrG49VbDQjXbqmw95AMVgpFsCng+WsNzGYadx+p8eW7AecuK7i5Dx91jgXI5BQIxYvzQShfjo/kZAsIufP2BPz5Z0TPgQmYtzQNa5aXwegRJbBxTTkM7F8cI4eWwLaN5dCooYhYZDuIx07LSFC4JyLSRNui16AEbv3hU1VuEIXIplpVIQhSCQ8VKwoQGGzCrgMyCPjAmWMVubmMTCsIQexaDrkCpk8phXLl+KhXRwSlksJ81hW1hgJh4Yo0PL5TFd27SPHzjxED+xW3XwfpGRZ6yJjEXHdynsmzkmm9gXJcB0oVhZkLUhEXb0Fh/ANNWLg81yqbaSSFY/Nw/ky9equ1L0Ak4sEZFEXbFzB2VAn07C4FoXYtIWZNK4W5M0uhaRMxCJ06SDBpfEnfNpMQAJp3iIOnMAMAOr5M3FY9FL4AAAAASUVORK5CYII='
}, {
  'hosts': ['btdb.in'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABcElEQVR4AZTTA4wdURTG8UFtI36K7TSo3bBRbbuNG6dWVNt2G5S7G+7GXtve8PHO3f/Z3FlrvuSXXJwzHqt3otHo+Egksi4cDr9HLTJGLd7LntT07rH9AZsLtdZnGW7BDAyWDryybft8aWlpvUWcXs33GR4ZplkyA0ekVnosYsdisXFKqRumOUhuua572vE8byWTzQiazV29PJx38JBACsqM/XnS0MiY9TQ03skBGvAbW3AYz7ELG3HZjHfgDZ5gC46hAvWWOdJDLDGe4i62Igvr8R0bsBNrsQg50I7VkymYi1bMxwzMgwcFBzamYxpqYfm38A87cAx5yMV91GAv9uATXmAnTqPAv4V30EghAw0PChppQ0P1q3tn80Gs58N4wcXMRJC080Vuc8gfJq8RNK+l1ykuLk7Jt83CzwDNP6VHeh2ZyY/Bwn6Gt9CBodKBW1Lb52fyD8IlnWFzC9MPqIMSZvxB9qTGb5Z0CiCAAAMAN8+yDH6UrRYAAAAASUVORK5CYII='
}, {
  'hosts': ['www.bing.com', 'bing.co', 'bing.co.uk', 'bing.com', 'be.bing.com', 'br.bing.com', 'ca.bing.com', 'cn.bing.com', 'de.bing.com', 'fr.bing.com', 'hk.bing.com', 'it.bing.com', 'jp.bing.com', 'm.bing.com', 'nz.bing.com', 'ssl.bing.com', 'uk.bing.com'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABWklEQVR4AaRTM3stQQA9691no3u22T7EZhlbvyK3i40qZnVvFbax7Sq2nUz2m9g6zWLmaMBc02gILgEWW2AAPL9zB89u34bAcecWoLB4/RrFLi6IMzPDVVE8vwDLMLgjy/j79CkUnj+/wN46565wECLH4aYsg2PZiwnIaoVECwsEGxpC7/lz3JAkWvHMArPLy2gaGoLL16/ItrdHvqMjAv/9w9Pbt88msE4IcpubUTcwQJ0/PHgAv9+/YfnmDZgzCFB0jI3BS6dDrSpCAErkDtTgj3O/JoowfvkSAarr63v3wGzVGpidPbUCXbBkGxtEGBvj7f37VLCirw9uWi1ym5pAjkuwvLZGJyuCgG+PH9P3nokJRJWXI0clziwt7SEfECAA0hsa6P57/fgBWRXJVL8jyspobEL2Uo9JML6wgLDSUuja23FFFWgeGsIqJR6PS1/nDQAAAP//AwAZCHCEYrNOowAAAABJRU5ErkJggg=='
}, {
  'hosts': ['cse.google.com', 'ipv4.google.com', 'ipv6.google.com', 'ipv6.google.com.hk', 'www.google.com', 'www.google.ad', 'www.google.ae', 'www.google.com.af', 'www.google.com.ag', 'www.google.com.ai', 'www.google.al', 'www.google.am', 'www.google.co.ao', 'www.google.com.ar', 'www.google.as', 'www.google.at', 'www.google.com.au', 'www.google.az', 'www.google.ba', 'www.google.com.bd', 'www.google.be', 'www.google.bf', 'www.google.bg', 'www.google.com.bh', 'www.google.bi', 'www.google.bj', 'www.google.com.bn', 'www.google.com.bo', 'www.google.com.br', 'www.google.bs', 'www.google.bt', 'www.google.co.bw', 'www.google.by', 'www.google.com.bz', 'www.google.ca', 'www.google.cd', 'www.google.cf', 'www.google.cg', 'www.google.ch', 'www.google.ci', 'www.google.co.ck', 'www.google.cl', 'www.google.cm', 'www.google.cn', 'www.google.com.co', 'www.google.co.cr', 'www.google.com.cu', 'www.google.cv', 'www.google.com.cy', 'www.google.cz', 'www.google.de', 'www.google.dj', 'www.google.dk', 'www.google.dm', 'www.google.com.do', 'www.google.dz', 'www.google.com.ec', 'www.google.ee', 'www.google.com.eg', 'www.google.es', 'www.google.com.et', 'www.google.fi', 'www.google.com.fj', 'www.google.fm', 'www.google.fr', 'www.google.ga', 'www.google.ge', 'www.google.gg', 'www.google.com.gh', 'www.google.com.gi', 'www.google.gl', 'www.google.gm', 'www.google.gp', 'www.google.gr', 'www.google.com.gt', 'www.google.gy', 'www.google.com.hk', 'www.google.hn', 'www.google.hr', 'www.google.ht', 'www.google.hu', 'www.google.co.id', 'www.google.ie', 'www.google.co.il', 'www.google.im', 'www.google.co.in', 'www.google.iq', 'www.google.is', 'www.google.it', 'www.google.je', 'www.google.com.jm', 'www.google.jo', 'www.google.co.jp', 'www.google.co.ke', 'www.google.com.kh', 'www.google.ki', 'www.google.kg', 'www.google.co.kr', 'www.google.com.kw', 'www.google.kz', 'www.google.la', 'www.google.com.lb', 'www.google.li', 'www.google.lk', 'www.google.co.ls', 'www.google.lt', 'www.google.lu', 'www.google.lv', 'www.google.com.ly', 'www.google.co.ma', 'www.google.md', 'www.google.me', 'www.google.mg', 'www.google.mk', 'www.google.ml', 'www.google.com.mm', 'www.google.mn', 'www.google.ms', 'www.google.com.mt', 'www.google.mu', 'www.google.mv', 'www.google.mw', 'www.google.com.mx', 'www.google.com.my', 'www.google.co.mz', 'www.google.com.na', 'www.google.com.nf', 'www.google.com.ng', 'www.google.com.ni', 'www.google.ne', 'www.google.nl', 'www.google.no', 'www.google.com.np', 'www.google.nr', 'www.google.nu', 'www.google.co.nz', 'www.google.com.om', 'www.google.com.pa', 'www.google.com.pe', 'www.google.com.pg', 'www.google.com.ph', 'www.google.com.pk', 'www.google.pl', 'www.google.pn', 'www.google.com.pr', 'www.google.ps', 'www.google.pt', 'www.google.com.py', 'www.google.com.qa', 'www.google.ro', 'www.google.ru', 'www.google.rw', 'www.google.com.sa', 'www.google.com.sb', 'www.google.sc', 'www.google.se', 'www.google.com.sg', 'www.google.sh', 'www.google.si', 'www.google.sk', 'www.google.com.sl', 'www.google.sn', 'www.google.so', 'www.google.sm', 'www.google.sr', 'www.google.st', 'www.google.com.sv', 'www.google.td', 'www.google.tg', 'www.google.co.th', 'www.google.com.tj', 'www.google.tk', 'www.google.tl', 'www.google.tm', 'www.google.tn', 'www.google.to', 'www.google.com.tr', 'www.google.tt', 'www.google.com.tw', 'www.google.co.tz', 'www.google.com.ua', 'www.google.co.ug', 'www.google.co.uk', 'www.google.com.uy', 'www.google.co.uz', 'www.google.com.vc', 'www.google.co.ve', 'www.google.vg', 'www.google.co.vi', 'www.google.com.vn', 'www.google.vu', 'www.google.ws', 'www.google.rs', 'www.google.co.za', 'www.google.co.zm', 'www.google.co.zw', 'www.google.cat'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAB7ElEQVR4AYyTQ4AcURCGqxHbOcW2beMU27Z5DW+xbV5i27btZGxP/6nendfr3fna/V65SqJUaJpWD8A4fm3HV2lK5Ctfl2VZ3ihJ0lNKDwC5o9HoNmQB79nERnKlJ3wDjBYMwnd0H2wThsDcrQVMnZvBNnYgvId262tCybUUSoTlqOkvbKP6w9S+YbqXY+7k5J5sNGIWlq0j+yZsNHdtDs/WdQg9f4LQy2fwbFsP69CeiPz4hlTUIT0mMOEnq2Hp2RimTk1Y6Gl6waeXj/W6gg9gIvcaIng8N3x7JyFeWPatKkoF72uSc4cpW7PulJz2S72UmqYVFVrcJycxZWUSAMYzK0IRMpBjTUK+HOXIRXnp+O+3lJxLC/MYV5uqKumULGD032ddwWViPhYeQoNszWj5u3v0xPyaUvPuj0Y33yWablReNfSTXgowwUgI/c7MQIODvdDscH+serobD/+9xGPTa2x5eRjd9mxC26UOjNvmg6ZBh59aLSnWSJu4z8eafFaadn0JfXR+p/SokKM5rWw7nUpwCCy8XlGUSaKZcuntCSYYDeHAu5MYcn4umh3pn+DNgLMzse3VUfjCAVG+KwByUjKEkk1x1H5dcmEpnamsw8rGxsa5rMi2njAe5c0c6n9dQlYPAAAA//8DAC/1CuhOHk3iAAAAAElFTkSuQmCC'
}, {
  'hosts': ['devdocs.io'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABbUlEQVR4AZSSgYcCURCHv80pAQlAUAKqFBFwCQgCUehvOgkoAKcQkCgAKpQuqUKJKERB4KTQXjssz7W8u49l2f19b+bNGLVa7d0wjA8gxf+YhMPhT6Ner09ST0KhEE8Rf8E0TXa7Hdvt9tsSmMViUR92kLRaLVyAGubxeDCdTqlUKlSrVebzufysomZEoIa73S7j8ZhEIkEsFmM4HNLr9eSbE28ozGYz9vs95XIZn88HIKJGo8FisZB3lZcK+v2+daqEbfx+P8lkkvV6jROu3305lep2u+UetIJsNstyueRyuWBzu91YrVZYY9YK4vE4z+Wg2WwyGAwYjUbS//l85ng8cr/f9S3kcjkymQyn04nD4UAkEpHTN5sNnU6H6/XqPAVVEo1G5bGwJ9Fut63NkzEXCgW1Aj0ej4d8Pk8wGCSdTr+0IDesw+v1UiqVCAQCKBkRfP0ImDFgAiRlJn5+/q/kZmewZlFR0UqAAAMA6K6ifD+b58gAAAAASUVORK5CYII='
}, {
  'hosts': ['developer.mozilla.org'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACO0lEQVR4AWKgGgDwRQ/AsiRBGIVPdVePvbZt27YRWNu2be+zbYSfbdu2rZnqrrw2vnCe4J+xP8eq2J/jjnZbzrmZ1gti9fRw5L/J16s2C08s7g7lVOz3MVHgEuB5FHcdiKXTVuuFCJ2wtnt09zaj4EEc9Yx19dkH4un9CIMRaQ2M1uIH/wDPABoAY8DKmaB+UiIfY8WKSIYAJQHgGQ94CLgfVG+NMTlAU04VfE5KeTx+apaIVulh8w+glDBj0172BgLGp5wL5LRUHMovz5+d4vtbTuTguIeI8NZ5KUTg91Gr+GXyOvB8qtO2EKAQPKV46YKj+OLWE0jHPCooAISXLzuSmOfSedEe5u/MYwEAjTEIENEOR0Q1Ya2oTzLs8sZVR/PGdRHu6zSboWt2AVAyIgAOwr49eXwrNCYedjkxoRmaN6DAkYJBjGHH/jzz1uxg444D1LavYNm5PyAQmLJ8G4MWbALjQ8FHYwIBwQKDl27kmQ27OOnwFBXmr93N063Hs2Wf4fBMnOIJOCBUUu6THXqBPAyggHvPPY4mz17G4dkoAG+3Hcv/I5cAII6LDSeoZrAWYxTlBOg3ewOTvhzIA+cfyZlHpxk6cy2Vr3YEHEMFhaCpiJBHqWni+HPX7Nh/238jlh6NWOUU9oKIABtxZBCOfzTCFUBUAJfT7rgBK2OANxF+pedz/Tnz3nZYmUJgU+Ln1yDyNch7gtsV6IJI7+K2AxsI6qEWcepX3Fpr9XBLj4Y80jZaJIAAAwBvMQnsKjj3lAAAAABJRU5ErkJggg=='
}, {
  'hosts': ['dianying.fm'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAX0lEQVR4AbySgQYAMQxD9+r+/5dzHOKUQMsCaUci2Xa24EiaKeFjG8zYCRaQtNE9/TB2DShP2wqeW4qwmyuaNuNUsbaXXfGTAP/dPE4AXHiFV+QkJDhnoAAAAAD//wMA5slQ23+aTBEAAAAASUVORK5CYII='
}, {
  'hosts': ['dict.youdao.com'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAzElEQVR4AWIYcMCIzHmjqJYApOZDuR+A2FDk/q0HQPEwIHslTBwoJgjTw4RsAFBiARJXAIm9C10cbgCaC2SQuA9AtkPZPMjimAYggBgS+wASW5ZYA9iR2BeR2MguO4isgQXNAD4kdjzQSxeA9E80F1zAZ8BrJLYBEO/HEnMX8HnhKhCHoYk9QNaMCFhEOsAEiFgBRdl5IFaACiWCohpfQuoHUhuRvJAP1oyw3RDEwBcGBSCMw9+OIAZuAxDJVwBN40SwswctAAgggAADAPQ+NfxbOZCYAAAAAElFTkSuQmCC'
}, {
  'hosts': ['dictionary.cambridge.org'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACd0lEQVR4AYySA5SeMRBF39q2Udu2bdu23YPats2j2rZtr238fN1J7d44mTsfIYyu24jLa5Xioq71uahTPc5qXIGbu3Xlhl37ctoebu7YiYtqV+XiLnJeX8WKgy/IRtayUny2KpjP+pfgrVIg505nKsl0Us3Dhudh9IxivDc5VJ2LAwCm0iW5uSH8dTIiHZzwvpAZtMU8IaRl6fD2bQyEsBdJeORHxIe6wKVYHuV8TeCUZg3PcuYw1VjA2z8Zen9CiImOg5ufCwTLmHi42abD0twU9h2VA8FcOpuUcLyc/xz2ABJN3WG01wENgNAQX0REx8IHCmTMTYct3yAMgMHD8VsCM/8glCrdEt8TZkKEXT8Po8GIGDMTlGo3Hd9z9/Y9ALehmLdoCYV30bF8+OQlP+jIY1PH8UFpB94s6sAL8+YwnuS9x8/5ITqOgjhf34GQRuBDeBScvb1gMAcCPfxgprWEqc4Cob6B0AJw9fbGm/BwpOMbJtLt6NCFHUvkw/c8TI5CQsX60BuyEXjnKvLaueJ7tj18jq7btikfKyuXVt/2yhR3nmjnx0uFrNS3jyHl1tX8VGFLXpnsznOtglSsOF8fQVOyJHxGByE9rw9cKlkhvYQ9hIt7jwJZULj1tkdqqC/salnAsU4e5XxNYBdSGlHz38PLOg3Z/m7wyGcFoVqrBjh38CgEY5QVXJ0yoQ+wRerJl7DJcX5gbtvWVI8xN4RHB7qr296/5wgj0rLU/ExTP96anUfFTO3Wnvgdszt1VwHSRArL1EgSmX/dn91zGPE3jhw+y81FiyopnWQmqeZrKpTjufO3iP/l2KmL6meRdu7Sn8WPAwDhe2jTyQQe0wAAAABJRU5ErkJggg=='
}, {
  'hosts': ['duckduckgo.com'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACiElEQVR4AXzSA3QsWRRG4b85tm3bto2FsW3btm0bz7YdJ42oYrPNPXXG/sp17148+ru2Y1Y6tuVw3+ctB4rm/UXLAaL1YNFyRODztmNWO1b/xznYH2s6PEBszHsUCzn+LD71S5qPWQnniEDs3+NDPHTdcSIm31pH/6u3Ub+jqNtKdFy1P8k5ozDd95yGc4iXv8YH+mK9z14J6RR9L1xDobcdY7puOpL6bUTDLqLvxeswvc9djTUy9UesdJRz/OqYjhuOxDlA/ENjOc4uomFP0XX3mRjn+DWwVtGDvJXxGT8Sn/wl0W1E8utneHMqzK9qJ5Mr0A98ND3B8FcvUr+XiO4m4lO+Iz5jBNYquo8wzRfuRnQHkfr2eaoGYPMTXmDE9DBm78tHUPL1SHfdQ3hHL845+2GiewtF9hQmsruI7Cxi375MDhg1q44/lJOffwyFEkFedN4vTNhtFN5DmMiBPkK7iubL9+cPDVAmMuNEyr0G3vS4+4KEdvZjQrsLb9Ejo+DWu6mIlFi6UH/YVEjKD0mJyoCW3xKtd1lWgR33lLHWi19fxGaO0Brn3qpCVsr2SQwNykg+DYx5SH3vSf58XoNjPGp/TVrrwlsUmz7CrfWFQgcud2zoqDUwznXHUraBSE4bxe+mzCa0hfjykJVtqGi57lRM6Kg1sVamcnfVtz3tDlAiRustZzDw5C2803Y2u047hgNmn8QRM7dDj23M8B3nQSxBu7vXGv1ZyZ6KOXeeiSkuXsiE9EusNHYLDi6/kJfqn+Gt5pmYtnvPxvbq3yzdSw0V+3iJjfiYv8uN/IzQPn4q3D36P9X7aP2SXfV12bZKVWwl7CrbTqly95+t6W9+AgAA//8DAMJfJ/Vie74hAAAAAElFTkSuQmCC'
}, {
  'hosts': ['explainShell.com'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA3ElEQVR4AZzOJVAGURRAYdwdeqFhCXrH6Y1IHxqRhFR6RSKWqbgk3N3d7uMw88tdlzPzrT7LiNEgMhG7TwjCp3YswC8MKhDYBAQ/+MYj6iFogm9PKHM5iUE3auFZM4axBMEnFvCLEeShFK6ZhGFcqW9ZSMSzR/eJu2AmIQcGOoGjTHSrAUV4VScI7FkN3INgHYe4Q7IqOBpVOw8knqdg0IseJNuBI4M99fybeG6B4Av/ncO1NhiAuONWneoMY3BPTXxQR+xHEc6xBd/6IKjBPG4QuTxE7g8AAP//AwAN6UGAASFkJgAAAABJRU5ErkJggg=='
}, {
  'hosts': ['dict.youdao.com'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAzElEQVR4AWIYcMCIzHmjqJYApOZDuR+A2FDk/q0HQPEwIHslTBwoJgjTw4RsAFBiARJXAIm9C10cbgCaC2SQuA9AtkPZPMjimAYggBgS+wASW5ZYA9iR2BeR2MguO4isgQXNAD4kdjzQSxeA9E80F1zAZ8BrJLYBEO/HEnMX8HnhKhCHoYk9QNaMCFhEOsAEiFgBRdl5IFaACiWCohpfQuoHUhuRvJAP1oyw3RDEwBcGBSCMw9+OIAZuAxDJVwBN40SwswctAAgggAADAPQ+NfxbOZCYAAAAAElFTkSuQmCC'
}, {
  'hosts': ['github.com'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABqUlEQVR4AYRSNdDWQBR8uRxOPLjT4u7SYn2Bl9AiNVpT4e5ufYH3Je7u7hF2v8nDfsnOvLm9vd1z+R9hGE6N43hzkiTX0zj+wCKnxrH//c5f3E2jaLdr7XxpBXmW7X/19u1iUvaNhrHKpbowQQ+9pKLAyge6delSJlF0wff9sZBWe553C9u/1qgk+QptubV2HD30MiMEjOMpsHDOLdWcnVEdSbSvx6VH/cyadtYuVVeWZTsq+gn1peLaL0nyPD+iIrNGjJksHCiKH47jvJYawHMX3u/kzBo0PaqRZ+/fv78rNXj37t19eJ+TM2t0a0CAMlIPI2UZVrw0SD8kcx0nwPPMqUvjM810jfHJkX1k8JiXirKUF69e5UWWnYg6d57UUjjyvInWdbf/JZ2XIAiGB15QovOdl2iMKVFf+ETqateu3XRoL/X5tKIoGiJEmqZbG0KbNoMRnBf4/gVMPFAq4HONxtb/CeO4G+Rv8Ifhx73BrH0RDuVfeBj7rGH8ztPyH3Qnm2DMUK/1eSt01zAWWi+tAYaV2N4VbDtWDTuK8PfPQl/yv/+XAAMAQfOEjClih4cAAAAASUVORK5CYII='
}, {
  'hosts': ['movie.douban.com'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABNklEQVR4AaTTM3hlURQF4DW2bXVjxenCOk7fxyjTxXbSl7Ft27Zt6yT7Plv/w+Ve3+ElwygL1jDXAm0Yvv6PS/B9xKALCrBOtmWaohqqvQoAQ0sj8MsPgCaohnABY9tTiK6IhcYu8QPIt9c/UONagIvW4dKlS2Dy3+eYRlmjdr5J2AIJY2sT8MjywfHhLnD1BrgkdgycnSHGPg5fnnyCwEN2SzbgxvVbqOyrgzy7J4eQJhNweLSPjy8/Q5471CJVAdTEDs9qqOuy4KR3rhvWyXYgp+wMv4JMYBBuzv3onOwdH9A79K78FjSO1mN8bRLvH77F5MoEpC1uL6JwrAwPcYsGULIFG5f2uV9qVzauXL4CZz0nCAjO6ZngXYmlHFOdzDRFNcKlXDPRgCe3HkMTVEN03s7nAwCYGdwzZa5BbwAAAABJRU5ErkJggg=='
}, {
  'hosts': ['rarbg.to'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAB80lEQVR4AXzQAYSkZRzH8c9OR5knCd5ByADYQdBdgW5QMAdgCckC2A5iN4SuVsgq4BoibpMTtwANQM0F7AyIuVWkHQH7viir55Gce3qMV/Z26r58vV6/5//z/J+NnPMGXsRbeBaPrPMbvsMvLnEFr2Ifr3sy5/gUn+Dh5YKXpw9q48MlwWN0UVXBjWH13HDQ28fz2L1YAGJk2STdRIoeZ5ncnzf2ttka9nbwJX6CjpaAbiDg+qBysLO58vrVShWsssl0KfIMXlu7AYQu0O8zvNaDR5v9XufmeEZMEmJN6Hnhvwusk1LUlUAVVsPwq/WClkBTR9NZLabUmc5rKUZ1w2hYCZzjh/8piETmTePo/gkQga3Rpu0bA7iNpZaOlpiSBydLs/mJpqn1u8S6EWODqB0+x6GL5JzfLf5+79tF7m7urty5dS/nQvmu/quru3m0cye3TIpPFzdysYOWiERsihEc7I0M+kGMyXQy9c6HRzDCB2srkKTYSCmJIjwMIfx1+2BbaMvH4yOfH07gfbyNKxfeAE1NrFcl+AMfXxv0/761tyWlVebme2OT6Qz28aayxxvF47OzP/Px8SJ/Xzw9PcuFH9s9P8uF48Xi33yxOM2Fn4tb2kMvFb8o3i1+Xfyq+EqbheJHxW/a7G7xTps/9Y8AAwBuWDrV8SP4MgAAAABJRU5ErkJggg=='
}, {
  'hosts': ['readfree.me'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACpElEQVR4AURTNZgFNRD+J/L83AV3d/cKhw5qrMa1L7AShxqtaJH2Oircnbvnus82ybCzQfb7koz9ska1s25VG9Q+oWD1neWd01YLlRViMADkO4GAmMU8eJf89fWEyssfHg7wrSkkv54U1PRVXa1eV9RkbNFGZNwihSJw4EgSiJPZgMurOzcdu7T6gJqP+nel0/ENwbNx3sM5WQ5eYllpGte/tdRTCEFBqasU8W0qcFgBWDEBzIysma/5bI7G4RF++/UXNBsNAWcr9qITNlltSyHwnDnea8iH4vrrzz/R63akgUazhcbRIbxzCMELPify3lkFsBNtqUYH0XYyGsKqgHKxCK01kiSR28iBDCA6ZcoJRJ2B3KJ3AUQEa21GNMOo3wKCgzVWdHJ3gAjJrIf69wURpC+s8RY21jfAMBiOU5HD2vr6f8pCxPkZYEQtkkjuxQZYoAWL3WOPQ/AB2hhERQF54H8EDBAvkvvPlhJmxFjeP4jgvAP4X5z0CZD5dAojmVIapeoCbKUIVdDSQ2AfbeZIgjY6hoHRDQ47KyWMnZZ3GfTa1j7uvfc+7O7ti2IOPPj0Y7TaLRQrVayureOyq66CIoVRkuDF577AOafs47CXelOp1vQVl11GN1x9CUqjBGmzifXLLsVFZ58CuYqlEg7rdXz/409YXlpCrbKIYsGinNWLlr0BoW+NCqyU+uaDD9A7OMCFr7wMKiiMxwlIW4RAWFlczN7MWv6qjbVgZs9Aj0rrx1985glbbz3+yEPnLgai6XCIzTPPwHQ+Qr3dAMPijNPOypRrCBzQ7w/wzNNPhtr6sQfdGR6gyknXGj36/fxTTzz+7u0TzlxgW7LZf2AVKa+VTjOhVGmFLAYISNM5/fzVZ+3EmXeaY/r2bwAAAP//AwDuWafATvpovgAAAABJRU5ErkJggg=='
}, {
  'hosts': ['s.etao.com'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAB8UlEQVR4AYTSAUQdcRzA8e//7+7UHSRmKLJQWQGitVHFQqKgBAABYQ9rrNBbGPagiaKBApCINspGA0T1CpQ8WhopqMe6uH93vx3vP5603oev9/y4u3P/H/eZ9nY3LUhzqQydHB978eLi5N3w8HSSz3cDE8CF/a1I3Y2OBnJ1dcH1daDq67NydgYiWWDL9jCl0ENDqHh5OZCDg5M0X4+MfOTykmRzc5LbWyoIqK7G0f39L6Sh4XlyenqrenujZGnJReQLEPJ/PvArfYjvxDMz36it/anHxnJovSUbGxkgjdZHbhICAuDI3p6HMX3x9na3Hhz8gFIuIk+Ak0cubsXSenz8h2pqiigWPQoFlyDYQqkskANmAc82WzYz/CNh6MnhYV88N/dVCoXXlLH78McWPDAXlRwdecna2ltZX/epqfnO+bkAPZS4wDtKPgHGNg/8BgLN7q5PPj+FMVO6s7MbeAVM2DKAa8tQPrMcmpszsrDg4ziogQHD6moO+Ez5cZU8e+hUHFlZ8TEGVVcXsrMzD7y0b5GjRCgxwBtK5rG0VFVliGNoaYloa4tQqgfIAtPAe8Ar+x6TNhdLs78fofUNxeKs7ugI010w6YpGQMYWlS1OeO//jSPF4lO0RjU2RgCqqyvHXx08OBE9L0A1KKKzAQMAAx7UqCMJEjQAAAAASUVORK5CYII='
}, {
  'hosts': ['s.weibo.com'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAlElEQVR4AdSRUQ6DYAiDyU7OfzN2si6N+RLC2OLj1lhFKlhr/A+qSlKYygzdGvimy8cnAc4l0tWnnroVZab6FTfU3LMkAAMbuzYdrbZNg7pra1i8Bbg2rYH+aWtowK1GliC+LXn49KwK45wTeeVh4jA6jvsdWJvWp4OeRUyIB1lim3eHZ5gkj5v5B34PLwAAAP//AwAQIhtWH9FOkAAAAABJRU5ErkJggg=='
}, {
  'hosts': ['search.bilibili.com'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABF0lEQVR4AYzTgUYDcRwH8N26WxQFpneIABYL9gAFRFgEkgIBMEJ6gAUIECYRxnqFpifoHTJEBu2W9Tm76vyZ3ZfPb7/9/Pxtd3eVv9y/1TilQVQJY0YDO3bzVPnNDl36tIqH5H2LPl3sikT5woq6wR2HvHPMK1l26bHFE2d8Vk62v7OftenLFUfUqZFlQkqWJJiPeOQ6Vm64YEqaCxPO61xSi5U2Uw54oUz2GNDO/v+MMev/d4Mwxbldxsyq4dL8ZPRL5xJTTEKz0E8WzBcekDIs9IvmCcGDJO7rZH4x0S+dS4wEh0jZefYgffhcY58hyxLRZMA4Vnqc80xKmSTEPFSVDl1GlM2IWzrFl2mViDKZ8ZW9TD8DAG7EbIH1rYECAAAAAElFTkSuQmCC'
}, {
  'hosts': ['search.jd.com'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA2ElEQVR4AZSTgYnFMAxDH+H2ajezsllushyYCqJy8PmCYAu5JrZSBHvDFsqojj7BddSN4oHkJMKUucwpoBATGBOYiJLFbFgSrZP9XYuv9WmU9wjOeYtrrd2A/Q9aP/fAQaKBoONxA2tu0ufHgxXihGe+79u76Pi7Ftd1ATxL9EYFhsXk6rjWiiWmjXmD+MC2GXZnTHfLAuceIa08vhl1zOcC54mnpip2gj1/b1ngPO21M2GjZC0sCrixFI8JJ/HC3DS05NZ5P9sveJ+Rf6D4hk/gDwAA//8DAFerdeknt5F/AAAAAElFTkSuQmCC'
}, {
  'hosts': ['at.search.yahoo.com', 'cn.search.yahoo.com', 'yahoo.cn', 'espanol.search.yahoo.com', 'search.yahoo.com', 'ru.search.yahoo.com', 'tw.search.yahoo.com', 'uk.search.yahoo.com'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABwklEQVR4AaSSA6weSxhAz/K92rZt27bdRkVQO07DRrXdhg1qM6ht+9rc/KuZa2yNMc9HZRxHJf9QdIHge0VRQFEVhC9/BfACB6qm0HZ4BdoMK4+mK0S+sriwIwwryf09QPep1SlT1eTQ8he4tqBx99JMXVufvQue4dniW02HcjBfR/N/jTnbWrJj3iPcQo9HLq3Hq+uJvLqR8HMN9CIKoXQX23YCjyLeplC6qoHA+zkgPdXnv6IqxcprpMbZQI4jm/Yox4W9778LUPqxNeDmxp3LM3hOfc7veYeV7NJ1XE0GzKrLjkV3uXkiDCRBQF82BY+AinWK0WlYDYqUNHhxI4YOg6vRY0Jtti+6w60TXwIQpTfr5S+TxVSZtaYtbfpXY/XAs6Qm2L8LCELKVy9G1PvU4HnhBCpW6j90QyUtqUCClrkXvsw+t1LczDdmdqR8TwYBUkja9K2OEDI7H2zLy4yITlxYOkUzP3mu4MuLBFr0qMrVw2+AHICaD5AQ9iYJJ+QTG5aGa/skRlkIIQilufiu4P/iBjFf0vAc8a0JAJ+eJfDxSXy2FooCElAye14+ZJkZ/iY5e/+tE/+yZAgggAADACTmwCZmGWV4AAAAAElFTkSuQmCC'
}, {
  'hosts': ['stackoverflow.com'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA80lEQVR4AaTRA2hFYQDF8dlerqWXh7y4OCtrCrOX5qU5zLYRhuyabWQuzzb+s971qV/nvXs/dg3k5CzD0oXSGyPIST+LxGhZIBZFLKKj5YXBMQj48T8Z8zCWe4JdNDOhHMZ2Vdf1/D9CHr5iKHEKZ6oXNgjHPdYRyoKLBsREzyQdVYAWBs3SgTzLopcQhUQEQ/8C5AAbaGPiI930YRb98GHhUblX8KISEIhxVDJ5g/6I/itMUnvY/JCNNEThX/RdIRUecEPqR9tild0raf3p6B1+Fvsa8NQzTu8VGCAYQ8krcEwGyY/JizC8QW8AAAAA//8DACeDUuGQ5pIsAAAAAElFTkSuQmCC'
}, {
  'hosts': ['subhd.com'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACAUlEQVR4AXzTQ7QkQRBA0Vdj27Zt27Zt27MZ27Zt27ZtG19tFPLkon3LSEco+CjbamkxoDdQDcgCwgfgHLDy+q7+9/CgeBSMBywEehDaGmCwXpEZIJpH4ZNAD0WBRtXysnB8Q3bMb8uGGS0Z0rk8yZPEQ+oBnJRliAYgW64AMLJHZcb0rkrK5Al4/vYX4VFWWtQpxNppLUiaOC5SBVkGRY75LkDihHE4uqorV+6+Z+zcE6gqQs3yOZg4qBabD9xj+fYbeCgeDeiNFD9uLKJFU/j4NUwUljh99Q2vP/whRdJ4+OgdA6iG9P13BF9+hNOibkFxf/zSS2x2FwCdR+8igGrRPJZKtDpu3gn+h1sY1bOKGM7kIbWoUiob0aMpBJAlGj7efPxLu2HbmbLsLA+ef6di8SxMG16HzbNbkzFNYnyISXwN5CAwMS+Na+Sjd5vSvP/yjy6jd+PZXjTgHFIT/ceT67qTN3sqkEwWO9sOP+DI+RfkypKSRAli4+FcNGAl0ufv4SSMH5vaFXLiQ8SA0+XGZnPiYSUyElfrh2ocNx58VN1ut7r7+CO1/8T96qDJB9W9Jx+LdycvvxT/yGM1QAwQBgN5gArj5p1kaJcKNKmZnxZ1CgLg0ls+deUVs9ZcQroiyoRIJhGV2TMlR29YTF54pDVgMmmiODsDAAAA//8DAEre0PeV4xaoAAAAAElFTkSuQmCC'
}, {
  'hosts': ['torrentkitty.ws'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAuklEQVR4AWIYcMCITdDazkEZSE0BYg+o0AEgTjx66MADDAPmzpvPMm/Bwt9Q/hsgFiFg6VMglgYxgAYyMiUnJf5BkhQhwtXSyBwmmEmk+RyhhwlJjJlUzRADEIL/gJQBcZoJx4ITkNqLJPQTiJWBmp/iNx7ToP8gjE8NEx7NzEhsIfwGYGpWB1LI0XsDKKZFigtuoPFFgfgqkrd2IQwgHYDCxBVkED4DfmLViIi5N9DopBwAAAAA//8DAPiuOaPbfaE3AAAAAElFTkSuQmCC'
}, {
  'hosts': ['twitter.com'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABp0lEQVR4AcSTJRwXWxSEZ869f3kPd3coOBScRMLd3RL0HxUveMHdPWMFTTgFd4kUfO9hcHf71nfnm3X8cwjRe9WFWrvHNLqBz9Bn9cUiyGmgjQUQ4b4NnqYA6KzpDBWoAto57eyya3TDk58UrL2y0WJuCCyAoGIZNLlm2zyl2aYD5S3mKzDmD/VZc3mSCvlG1nYVyYMZC1AGjDkwp/VckQy5jiCfRtIuMcR7JKs4bVHKnk7ss+bScrjvpVlOQWr55m5BErCXVzJ618h6Z6N7KgVgLi1OQ87yFkIzpGyBLg8vRb6T3yAHytyHiJpczHrZawGU4MFBhQC+LPkUF+kC3lT323xniYX8RJD4Hjx7emL7oCqtIQwCKZusxvmAP/q27fCUlkC8LdgxtOYTT8/awlH8tp+u6oRr3xW8IWUDdPDYN+xMJxq5Y1jNh3gN8R79Nt0pzZhbSnLQR4eE5CybuH1Q5ZV4j6gPpznIHqA1UaYbUiiNED4+82VP2QTJBz77L/Rdd60jQxhFi50RYk2SeQC34Tihq94hecuOwdWe4E/wHAAA//8DAJXbtGARsI7nAAAAAElFTkSuQmCC'
}, {
  'hosts': ['v.qq.com'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACq0lEQVR4AYzNA5DtSBhA4dOd5PrZtm0W1rZt27ZZWNu27YexbdtK5ga9t8aFxdcq9fkZaelHNccu+aHMmvNprpr7XnpT5JbvL+H/qDqbtTkPTnaWflTVcX6iUvPrvb6zIKdZzfw+3174WfIZ//q56PbJjnrbUNckB9TTTXLwDIVW7ar1FnyW3Ab97rrrLgn9xCP7ai/eeKO8AODyiS4TApKqasn6DQ4AT5Y5MAs8xyOUXEjOkcsEI8jj54lTAbDBpwv2/uZyyfInSdylaKwNcO1cHSpB6hK1bSFr3stSjCB9nqsDOB0C5afPssmncs7amygp6qGgjKFI1PUYd/Iy1n+UroYDBoJqkN2Krh4FQFAfzc6Z9/Hy4d20lkJLg9cXUVUGFXUe4w9cyZqPU8y+gGkjVRe0lxjYpmIkTfh48ahm8nIkddX9Eao1Ck3BwuWrA7HIe7K7C2IBrChIQR+lFAgAgaFFCIbBVdBYowAwo1DneuiNzkl67KW1BCwU3d0KEDQ0V9FrWxi6wY27FjNmgqCtwWBX7m8E5pfiZxSddW1geflSCnRLuX0TDI8+kyfOZOzo8Tz0x8GMniJiIUjK/QI5djSqx0Fk1+J8+X1axjVbl8kOtEZDKlwpEVH6pJR8zuW/zcCbWordE+a3vT9ijp+JEyuZpZXwy9e/5Lx45ToA2Yxe7tMkjhAY+AiF4a5fT2LcZIXZu4KE7G8QE8cCUJ+UjZERvyvnzdv2h376loj9XHWPeqErqOlW2wrGT8xG6IrimvOoLjsVd9pERK9NW1KmOcOs2Zv+7m37MYIAqD1HO6nMDr9x5oLvfP65YSGliyv9AAgrSlNSUi2Kv9X/YlZaN95cqVJ/dK9q64n/8v0H/qt2nPivVLPhtUTarM3i6TOccekBCCCAAAMAccREbXFAfgEAAAAASUVORK5CYII='
}, {
  'hosts': ['www.91dict.com'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABuUlEQVR4AWK8b2D4n4ECwIQu8P/3b4b/f/6QagBCM29ICANvUBCAdbJmjyKMwugZN7KOu7u0uLRYjzVImxrtkl+BQ4XXOLRQQZsy7us2wvdc3C13Zfy8MjOQfDaWtFoQRb8HoGmgIHpHB3G1StJsipvMyRNkTp3CXr78O5D+9fUazqaNGKkUhQvnSR07StJoCATbBl2XbXXiTwDqpGkHD+Bu2ULj1WvC/n7Zp1kWtJr4e/aQOnxYIB/H/ArguuoCh3ZPD8H+faJUf/GSbGcnAGNdXUSTkz93oGczsozGxnBWrcZZuxYtCACkVGvOXFJHDks33ztQJ5iFGQCEgwPE5TLW4kWYs2YhE8e0+/vwtm+XSD92kMsigL5+BShJJGvRIuT6SoVwYBA9nQLd+B6QRBHWksVIhJERookJySoAEEfhoAJkMui+92MHrTdvKd++TTg8RPXRY8a6u9E9VzoJh4eJBgfFvnpOvgNIMd7WrSr3ErlN9qoV5M+cwZg1m9qzZ9SevxAXtSdPAb4vUfd9Ji9dQk+lSNohpes3qdx/QBJG6EGANK8iTV6+LH18nKl/G/923gkggAADAMIMty/MY2SRAAAAAElFTkSuQmCC'
}, {
  'hosts': ['www.acfun.cn'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACpElEQVR4AZyTQ4AsVxiFT9Wzbds2x7bNTWzbtm07Y9u2bVvt0xhuk+/a95egsPJ8RxCEWwEsxn9DQvJTQWntNfE/Dk8jEacPqzRFSYK6PjGolKFMMaIr2r52bnqPCjMs1l6AVskYCmVjqDC9gtTNKxEntqD6RjPWBvbrSo1+M+IXNSF1y0pUmF1D5rJ5ujNahGZje2LtGmyZvwjKj15B0i8P4vLuCqzUbJrL8KgEWc0ncPOAL8Rvf0PhjTPY8E80hAI9S564fAVsaUPilYW4vC8dyxfPB1VKCAIAiNCJSAXGpERm0BYYXvWB0t0eSXfdD6HcwplHPFxR+/ffkJpX4si+BVAoiKTcURheWKa5RIAATF0G5BTJsKviBjbo6yE/IR5IdPOlpL+f6Z6WHA85R3n4eWZ+cIO50T+w4fvzzPvgOJPfmJxXRF7g4N/nmPnOSxz58numGFsTg5ZujHj6OUZ8dA+Hgs4x/LkzLEmPoVIhZ3HcTwx74SKbK/OZ/cv9/PeJkxwJOs9/P3mWEU88xSFLd4oyAkHyFQjOLsfChfNw4JoXFFiK/p4eHNd3xymvH7Bu235I1hhh9yVvaPk9rQD/CusxRCUQZmRDm+c+pfd3f3PwnwtsSXmXX77xOssLCzhNT0cHX3v4QRaFvsnBfy/R9ccIOj/1vkYEO2Lc0oOP+95JmyfeZuzzR9id+jZlRRVUjo1zGpVESmlZFUuDXmf8s0fpcP8LfNb7dmrPiotEEU/09eHTnHQwfR0qCvOQU1+JCbkUcqmmyGSQaPpVPe26tdXVG/BZeTEeHRiE9qw2FogpFFQhYbgNOxatwcjiBRhbvRLCPBELhkexYXQCTeND0F+9BfMFEdOohZGZ/sMkkNn4MhMoS4IYcBMhGMEmkJ0BAwDvPYmKOw0pRQAAAABJRU5ErkJggg=='
}, {
  'hosts': ['www.amazon.cn'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABoUlEQVR4AZTQM5QcYBSG4TdO2jhVyti208Y2+7CJ7Yyq2Ghis481rGLb2t1v956xZ55zfvNeJFWXtEXSCxXuReRMdSStU4pQKKSFCxdq5KhRGjV6tPbv368sNlYFppLgzp07dOnWjUrEnThxAq/Xy4YNG0gxqTJQiwTbd+yww/Tt2xfvo0dMnz4dc/jIETKoVZUUy5ctY/asWXz9+pVAMMjnz58xb968IZPUC/j+/TszZ8/GXi9EZVIsXrIEO9yyVSuePX2Kw+Eo7gJLmBk5ciSNGjXi4cOHib/Lf0HLli1juRg0eDC79+what/+/Vku+PWaqJ07dtCgYUOMJdHpcDB02DD69O3L1PEjUOgA3JoXLkbSF51pLn0OKq/rw6Wbc6X7K6UjyM5WxrR3w6WmcHMe/HhNVp09UK8HNB4N1esk/MA8OS4dJVwu9gq/4nNK3oric0nXh4ZftX0vr9q67CySXivq3a3wRrvkSLiURVqdaSa9uCKjf9/CRXqNpI1KZfko1635CBc82YMzM8Gy8zQg/kZCdv4G1cMGAAAA//8DAFAY6Fo5M6yxAAAAAElFTkSuQmCC'
}, {
  'hosts': ['www.aolsearch.com', 'search.aol.com'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACd0lEQVR4AYzOA7QcSRTG8X+Nnt9b2zYO1rZtHq5t+2BtW7Ft27btmcm4u6u+9MROfmXea1jvpf9SpwJ3yTEOw2RgxucP7lFkFyJsciuOtzB8DXyL+Oz5P1JPPv976tKwHcwOGNZ78Z/UQgwHIZADWTYSWFlmA1OBydYy/LvH92i28YMX/01dZqCnHGTzIh41xGOg9Z+hdU2CTF7EIlAZN3t9++QeyQgA4lkcFEuwR02EiAFrAbduLHnCD9bN96g2VMUNvq8jAKLP/5XaX5Zf0zlHQ/j4/XvqQJaBk7wwkiGdE7GoYekqB87wxeMNJExAvzFezyn9Pp0UwfIKwKqM45xj4+XUOPe4OC5weD68eGsdvzy9B0/dWEWhGFCdMNRUOop57yiACNDXC8qpRbnyjEoGjM8QjxlOOyzOnRfUcObR4ue2y7n8zCoevqKSBcsDCgWFmUUPYoMbP0g2/6J1RmWrVvsq6zY8o1mLfc1dlNd5981XpuA0e2FWMxcW1a5vWj93KI5t0fTfwwB4/q/cHssyVr7nqUnPVZo0p6Ag8PV355UqeTZsgTyvpNe+mR8GCNR/VFKS08gBLb40rPfzf90/WmDOfrPXsBzHHZTg3BMNI6d67FUb48TDYcKMEjMWGi44JcHypKWmtprU1E8vNmzmvi8yS/avsPuns5Zk2rFXnSFfdBTylqpElD3C9ZKlJSrDecmLzojbBecYNvP4l8lrcOos55ATADiBA6yQBE7tgL9/ef/AVgCGrTz2yYr+ki5gwweBwGm+pH+Bf35578CpbCbGViQ9iNNsrMCpu8RfSE3Dh5bd9egatb6sSG96GUuMWoAAAwDtymkHKOF0igAAAABJRU5ErkJggg=='
}, {
  'hosts': ['www.iciba.com'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACB0lEQVR4AWLU2PoNQDk5ANnNRQH4u0me32/bNmoNatsc1xzWts1B7WFt27ZtPCW5p1h79wuvjs8SoCJgUDA0sMoSkcpAgGSEJFSm/xyobGmddjBgRGj//mCCxnN63xxJwATLgGeOylGQ5WoB4GPPdYZ+2obigY0cS5Sgy08GFT/z4Tfh5GPNiBM2p59qVGYBWgsCDPi4AyUD6xGx+O3z5iAeeh6I8CCuqfe1l0mFfTTeGuVmVFAqvQUuCBBUzwDQ5jfEQw3ovDHG6SeCQnH8YIzvwiZ1v7QYc8LOLEAQQEhCzE94ZHu59DSOaIUArlacfeLwsd/EdgUzvQDHFUAhAgDKuch7nmf8+baP7XdcAIKG5t/3LBZesNFaI6iMFgBpAtzr8GA8Y4r0YNZpmzsxTYNvPfz0tsXRBzFcV1BkdQGS34ahOXdrKROfdKbGd0HClmLXbZuDdx3GFA3QanOEY480hmRIo6RagFJ8sk5TZukYHmrhsYLPRGEo4a3av7OgSXmm9lzL2JLlUEiSBWlVp3DmfIN/+NdUi+0lM+6Bfby5cidfGp/iFheUSJIFpgCAs+QL7CG/gE22WLZw9GKE/u3rol1NciGBEjj67Bfk1seorz9BAFdMMhPzeuhWryW3gmGUBgBlTrgbAQJGsp+5IYCTsSeiSo27sxwoDygKhgBrXggggAADAHby8XVjjZf+AAAAAElFTkSuQmCC'
}, {
  'hosts': ['www.merriam-webster.com'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACi0lEQVR4AZTTA5QbWwAG4H9te59t2zYOns3ato5q27ZtrTWx7Uxsn+QGtdtveG1czXhoW5VfJunvbGs7at67T2Tet1/gam8/6BOLezs3LirDzXgFvIGGtes9qplziWn3XuKiGMTVRRHTzt1ENXMOMW7Y7PRx2f/hMmk4z0kxVlp27vm38svPUPrWG7ge++mzqafm26+mFr/yyshLLXO5Q6Sjx5OIy0kIid30CVutRDZ2UsxFUb+nemA6sbcmqnXJ8x57pKD0jddwO+ynziBsoC1pNOOBNL9CNsS8+8CM+wb3x51Qz5qHys8++DUzZDB9lf/oI+gS6XCgWYDRf34IFe3AtpMc/Pf1KzjNUMDs8ODemjLwlDS+fftJnOyS4fd770HE4/8yPUTT9+Xdfx/ury0FV2ECX2lCA0sFjz+M6rJCfPHGozDZvfCHwtCb3bC5/HjnuQeQe9+9CBvph9LTkEYApDL9n2gx2XIiEjESQxtfgxauGtEYgT8YQUVJHhgSPZ59uBYpJI1kZldXqYJqzUOMjCAeqi9HJBrDm8/ch06RLpGxDrnZmaBtXuTmZOL9Fx8GJdIl4rLgUmuQU18nh18uGZDcOF0iDeHKDcTt9ROHx0dOdUmI0mhNLZ3F4Sb+YDDxhIjd7U3FJct4OMwf0gybllaSQLai4Mknikpef/X2lvFMA0IaLR1l7XsQST42u7dk1DgScbtuvZFsNiIdMzHm6Wz7HpdLHJh5yUocLa03LJxomcgShW2NzRNxPR6K6q5budqRHJ953wHiZrGJm8lKHqzUYTKsXme2t7T8evPxLZ1S4hPx/3WcadhNb93BMm7fwXA0NOzwxnXlStyrhgYedPUAAAAA//8DAIL92UWO9SOnAAAAAElFTkSuQmCC'
}, {
  'hosts': ['www.so.com'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACBUlEQVR4AXzRAxAbXRSG4XM3zm/Uts1Rbds2x57atm3btm3bNqLd07d2v5nnGrkbI98kwdrqblH9R4yJT9etKveNkfuqGrlTaoHKNzGfNq6pbtHLTbM1CuF/WHiOw5goKitul5ofki9iQeKvqeZlczuaK9EQSeGDG/+jFKazZlT8NdX//+oABixjTGPavfEfLqIjSqAwWmIbPGjIcwayJ/jpAE5NK2xAANtVpDTv7n275Pwt2CUqk3h/ReZGwkFNDqnCIebjR+sLG7cYzCQ/Cc/8izXroNjG2oAQC2VgsJKTz8pPwj/wlGoSYsiCxBALSaE4rKq2/DonEUaQyxIIsYyjdjAcE2/M9rgdR34Vj+O4AlHbWLYqXRaTRgsK7t+/JKVuXJJmzo5lqTzyk1xZkcisXZq2yf6lKWJdF+Z9kHJF5ZRC3B19F5ckckVy0C6B/Nj+w49oIv/H90Rb0HQldYUP/xuK3WpPx7xeGTcx71lPOz1Oormq7BdVO1DuvoZWxrFUTELW9GeuBl6jNtbAMRxgmCxHZzL+w0Msww6EkAlVkQY2BqvIGCPvDrxKzZHcwikVhEGkhIEDQht4imGq2o+1PFWW44UlJFD2vsPEUlUpRrcTduEW7uIExqK0inRn7UvW7qbfCnWNfJPQKt6s4mPid+51cfkL4Uf6y9yz5Qd5I4AAAwCxHsqQ3ooHIwAAAABJRU5ErkJggg=='
}, {
  'hosts': ['www.sogou.com'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACeUlEQVR4AWJkQAMAwskB6JIrCKOn7zzEtu2UYtu2bdu2bZRiO2vbtvnb1tzeb+3dU3UeelqjhmM3PwznFuAEuTNCzJTdMb5ar1f5QJbBlhQet/mGRD4FTsb4mBD+x5iMEHsS/Wx5F9CVxG5fr0dZHcsWNxyz+WD5U8OJW27Eaph/bEHO/FzVIDIgIl8BUyyfXOnOHo2nbq1JbGTBErAI3qL4JKJ3JNgV3pz+QORL4ApTt6OAX8mGvXFOsST8ZNmQJRNQA0Co2lPZFtu8NX0Ss89pSSdiXBqAWzE+Xq9baa0KzjQVWzYh5JL2JLaeGqlZsrfit8jOlkk2Wq9rSS3BPsa5NQDHYfY/QgXlKkCJMjk5rJ/70nLJ0YpPyf815+t1/iuYP+A5EMH+Q7UZYEeMqYuCr1iwHVVwOZqsJleHfOZqrV3YcvmuX3tT67tqVAXCmAbsEIBUZhDrdiiqyf8950pP/UDcPzSjgGBgtq0Zz1gIk5rO3u4ohMjJNAOa7uwP9G08dZvTLGND8r/PGgvc13zRTvdrg5MI9pFH38fdtyT6QyhX7odqM0AH3C8CBWO8FjK/N5+/468EOmJM1vq1mM3RHdhHou0iiFQ1RocM8CnO4Ibjt/hAwf+8LT0Y43rLhOtxcHzJbaQ1FuD+TuPJW+2kZ+F6gh0GQs/Ci3KQmmyIaDxl670bT9/myqYzt32s6cztntP3o/p/ph6w/KL8V/XOvLjsCxQU/FaOaDhuiwNZC8q/dVEexiIUMKLfBzwre5GE9hiTgFTuSVvcg0x4gzQ+h3M5xul6M0faKrpvgnMFcJzcFSFmYPTA2Q/YEuNBFRcg5gkggAADAHhTCUbFsBpkAAAAAElFTkSuQmCC'
}, {
  'hosts': ['www.youtube.com'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA2ElEQVR4AdzPJZAWABQE4A93d3cSDr3QcacPGe2Du0PvCXdNOHf93N3dXX6XePfNvPp218g3BgrXLNqIp1iHWZiEqYI1ogU1SMeppVklmeMBt7FbbFMHbg5W4xYOjgXskrztMPDAHCHmP39v6tGTxkydJorZgQ8mCzFh81azrt2x6GeqWZeuG7dipRCzBh7E1p6Xq/X3Lx2FBSIZD2jCFAFa//5S//Shlu9f6OoSQXXgg+rQBxVH9oqjJnDCH8n7F/jgDF4jAxWoQ6halCMTb3HB6NAtgAADABCmMoxb3EUaAAAAAElFTkSuQmCC'
}, {
  'hosts': ['www.zdic.net'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABY0lEQVR4AWK8c+Pa/yorewZsINvZG4WvoqcBpu9cuoEQPBia8D9MSPQ/Olja1YTGxgQgvUwgQ1a+fYVh+6bOKQx3b14Hszd2TAaz0YHYm5cQF8DA+T074OxwYTEMNqYatf9MIFNA4MLenWAaqBiMgfIMMRraDDecvJDZKGprpPgZGKLVtWAmI4cFgo3pGpBauBqm369fM5ACgPpQ+CzIHEZGRrBT/4lzgLggNkwT2Pktzx5iGMiCLrDkxlUwHSEijsLW2LeNYQkkjNANQAQKEWwMPiMoIPS8nRgubd0Hl2QVFWUAhw2CDaNhXkWEBSgu0QEoeW9bOwPOf9rcARZDByDLGS7rusL4yNEJwhiKw+WFoQYhxGDpACwBYl939ITZjgAIl4A0gfIGwgCobaCMge5MnIZALQXrYwSbAgWN+iYgChzfNVLyDHxO9gxSNeUMz1o64Vl41qVTYDkQeAWMXoAAAwCEQ9L/oBz/xAAAAABJRU5ErkJggg=='
}, {
  'hosts': ['www.tmall.com', 'list.tmall.com'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAYklEQVR4AWJkAILNDAz/GcgAvgwMjIwgzaxADjuJmn8C8W8gZmIgQzOyHhZkQYf/xPnkACMjnM3EQCFgwTAZ00UIcQQg2QWD2oBRA1gIpDjiXPCTZHsReijOzgAAAAD//wMAc8wRWg9Qsq8AAAAASUVORK5CYII='
}, {
  'hosts': ['www.foxebook.net'],
  'dataURI': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABIElEQVR4AWKAARYWFjcg7mIIXTWTCFwM18eAAC7Ld+woZWNlZeBgY2Pg4uCAY25OTgYudnYGDiCbAyivHxmZfhWqiZEBxmBkXBMSEhIs6FLOQAjM2nNvNsPqsDQA62SgwTAMhOF/1xTGXqEAVX3/Z6mytwhGm1zWf9bgXGrYR4g/5/cdrTWQeZ4RhgH7vqNFfxigPG/eCqKq2LYNy7KgxTRNQFFpFkCV62AcR1jWdcV3xi3ocs7AcUQEMUZYmHMGmv2ClBJwHMK7peaarw24Au8G5n8z6C4NiGdQ80ZB+N0giVtwGpRSXIOa5+Qa9Od3wEHeLTXPKdgCPj74GEQ+P00LEQFe8e4ZvDVjwYIFJQznBB5g6MKMT3haBwgggAADAHIPu5SRk2QjAAAAAElFTkSuQmCC'
}];

exports.default = iconData;

/***/ }),

/***/ "YcCz":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

/* eslint-env node*/
global.Promise = __webpack_require__("qgje");

__webpack_require__("/FMp");
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__("DuR2")))

/***/ }),

/***/ "mzR8":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _DB = __webpack_require__("U2e7");

var _DB2 = _interopRequireDefault(_DB);

var _localforageBluebird = __webpack_require__("6PVA");

var _localforageBluebird2 = _interopRequireDefault(_localforageBluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let Setting = new _DB2.default(_localforageBluebird2.default, 'setting');
exports.default = Setting;

/***/ })

},["YcCz"]);