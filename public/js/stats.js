const statsHeaderItemTemplate =
`<a class="headerItem" @mouseenter="hovered=true" @mouseleave="hovered=false" :class="{hovered: hovered}" :href="itemInfo.path">
{{ itemInfo.text }}
</a>`;
Vue.component('header-item', {
    template: statsHeaderItemTemplate,
    props: ['initialItem'],
    data: function() {
        return {
            hovered: this.hovered,
            itemInfo: this.initialItem
        };
    }
})

const statsHeaderTemplate =
`<div class="header">
    <div class="headerList">
        <div v-for="item in items">
            <header-item :initialItem="item" :hovered="false"/>
        </div>
    </div>
</div>`;
Vue.component('stats-header', {
    template: statsHeaderTemplate,
    props: ['initialHeaderList'],
    data: function() {
        return {
            items: this.initialHeaderList
        };
    }
});

const statsGraphTemplate = `<canvas id="graph" width="400" height="400">no canvas 4 u</canvas>`;
Vue.component('stats-graph', {
    template: statsGraphTemplate,
    props: ['initialGraphData'],
    data: function() {
        return {
            graphData: this.initialGraphData
        };
    },
    watch: {
        graphData: {
            handler: function(newData) {
                this.graphData = newData;
                this.startChart();
            }
        }
    },
    methods: {
        startChart: function() {
            const ctx = document.getElementById('graph').getContext('2d');
            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: this.graphData.data.map(el => el.time),
                    datasets: [{
                        label: 'Uptime',
                        data: this.graphData.data.map(el => el.up ? 1 : 0),
                        backgroundColor: 'rgba(0,255,0,1)',
                        borderWidth: 1,
                        fill: 'start',
                    },
                    {
                        label: 'Downtime',
                        data: this.graphData.data.map(el => el.up ? 1 : 0),
                        backgroundColor: 'rgba(255,0,0,1)',
                        borderWidth: 1,
                        fill: 'end'
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            display: false
                        }],
                        xAxes: [{
                            ticks: {
                                callback: function(value, index, values) {
                                    return new Date(value).toLocaleTimeString();
                                }
                            }
                        }]
                    }
                }
            });
        }
    },
    mounted: function() {
        this.startChart();
    }
});
const statsBodyTemplate =
`<div class="container">
    <div class="siteUrl">
        <input type="text" class="siteInput" placeholder="google.com" v-model="site.url" @keyup.enter="getNewData()">
    </div>
    <div class="row body-wrapper">
        <div class="col-xs-12 col-md-6 graph">
            <stats-graph :siteData="site"/>
        </div>
        <div class="col-xs-12 col-md-6 siteInfo">
            <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam accumsan odio tellus, id feugiat leo egestas vel. Maecenas porttitor rutrum nisl ac commodo. Vivamus tristique dui ac libero euismod, ac laoreet sapien maximus. Morbi nec ante sed ligula blandit mattis in ut odio. Ut sapien augue, luctus ac ante eget, pharetra tristique erat. Nunc at orci nec nisl tempus fermentum eu eget metus. Aliquam laoreet nunc in placerat porttitor. Sed sit amet tincidunt est. Etiam aliquam consectetur eleifend. Cras risus quam, eleifend ultricies leo eget, imperdiet maximus arcu.
            </p>
        </div>
    </div>
</div>`;
Vue.component('stats-body', {
    template: statsBodyTemplate,
    props: ['initialSiteInfo'],
    data: function() {
        return {
            site: {
                url: this.initialSiteInfo.url,
                data: this.initialSiteInfo.data
            }
        };
    },
    methods: {
        getNewData: function() {
            const self = this;
            const target = this.site.url;
            const url = `/site/${encodeURI(target)}/history`;
            const req = new XMLHttpRequest();
            req.onreadystatechange = function() {
                if (this.readyState === 4 && this.status === 200) {
                    console.log(req.responseText);
                    console.log(self.site);
                    Vue.set(self, 'site', {
                        data: JSON.parse(req.responseText),
                        url: target
                    });
                    console.log(self.site);
                }
            };
            req.open('GET', url, true);
            req.send();
        }
    }
});

const statsFooterTemplate =
`<div class="footer">
    <h3>Footer</h3>
</div>`;
Vue.component('stats-footer', {
    template: statsFooterTemplate,
});

const app = new Vue({
    el: '#app',
    data: {
        headerList: [
            { path: '/kek1', text: 'kek1'},
            { path: '/kek2', text: 'kek2'},
            { path: '/kek3', text: 'kek3'}
        ],
        siteInfo: {
            url: 'google.com',
            data: [
                { code: 404, up: false, time: 1499106002921},
                { code: 200, up: true, time: 1499106009326},
                { code: 200, up: true, time: 1499113765891},
                { code: 404, up: false, time: 1499113789964},
                { code: 200, up: true, time: 1499113795112},
            ]
        }
    }
});