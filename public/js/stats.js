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

const statsTextTemplate = 
`<div>
    <p>Info about {{ site.url }}</p>
    <p>Average uptime: {{ averageUptime }}%</p>
    <p>Last checked: {{ mostRecentTime }}</p>
</div>`
Vue.component('stats-text', {
    template: statsTextTemplate,
    props: ['initialSiteInfo'],
    data: function() {
        return {
            site: this.initialSiteInfo
        };
    },
    computed: {
        averageUptime: function() {
            return (""+this.site.data.reduce((sum, on) => sum + (on.up ? 1 : 0), 0) * 100 / this.site.data.length).substring(0,5);
        },
        mostRecentTime: function() {
            if (!this.site || this.site.data.length === 0 || typeof this.site.data[0].time === 'number')
                return "never";
            return this.site.data[this.site.data.length - 1].time.format("D MMMM h:m a");
        }
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
        graphData: function() {
            this.chart.data.labels = this.graphData.data.map(el => el.time);
            this.chart.data.datasets[0].data = this.graphData.data.map(el => el.up ? 1 : 0);
            this.chart.data.datasets[1].data = this.graphData.data.map(el => el.up ? 1 : 0);
            this.chart.update();
        }
    },
    methods: {
        startChart: function() {
            const ctx = document.getElementById('graph').getContext('2d');
            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: this.graphData.data.map(el => el.time.format()),
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
                            display: false,
                            ticks: {
                                steps: 1,
                                min: 0,
                                max: 1
                            }
                        }],
                        xAxes: [{
                            ticks: {
                                callback: function(value, index, values) {
                                    return new Date(value).toLocaleTimeString();
                                }
                            }
                        }]
                    },
                    maintainAspectRatio: true
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
    <div class="row content-wrapper">
        <div class="col-xs-12 col-md-6">
            <stats-graph :initialGraphData="site"/>
        </div>
        <div class="col-xs-12 col-md-6 ">
            <stats-text class="siteInfo" :initialSiteInfo="site"></stats-text>
        </div>
    </div>
</div>`;
Vue.component('stats-body', {
    template: statsBodyTemplate,
    props: ['initialSiteInfo'],
    data: function() {
        return {
            site: this.initialSiteInfo
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
                    self.site = {
                        data: JSON.parse(req.responseText),
                        url: target
                    };
                    self.site.data = self.site.data.map((row) => {
                        row.time = moment(row.time.substring(0, 19) + "+05:00");
                        return row;
                    });
                    self.$children[0].graphData = self.site;
                    self.$children[1].site = self.site;
                }
            };
            req.open('GET', url, true);
            req.send();
        }
    },
    mounted: function() {
        this.getNewData();
    }
});

const statsFooterTemplate =
`<div class="stats-footer">
    <p>This data is collected anonymously from <a href="http://isblankup.com" target="__blank">isblankup.com</a></p>
</div>`;
Vue.component('stats-footer', {
    template: statsFooterTemplate,
});

const vm = new Vue({
    el: '#app',
    data: {
        headerList: [
            { path: 'http://isblankup.com', text: 'isblankup'}
        ],
        siteInfo: {
            url: 'google.com',
            data: [
                { code: 404, up: false, time: moment(1) },
                { code: 404, up: false, time: moment(2) },
                { code: 404, up: false, time: moment(3) }
            ]
        }
    }
});