const statsHeaderItemTemplate =
`<a class="headerItem" @mouseenter="hovered=true" @mouseleave="hovered=false" :class="{hovered: hovered}" :href="itemInfo.path">
{{ itemInfo.text }}
</a>`;
Vue.component('header-item', {
    template: statsHeaderItemTemplate,
    props: ['itemData'],
    data: function() {
        return {
            hovered: this.hovered,
            itemInfo: this.itemData
        };
    }
})

const statsHeaderTemplate =
`<div class="header">
    <div class="headerList">
        <div v-for="item in items">
            <header-item :itemData="item" :hovered="false"/>
        </div>
    </div>
</div>`;
Vue.component('stats-header', {
    template: statsHeaderTemplate,
    props: ['headerItems'],
    data: function() {
        return {
            items: this.headerItems
        };
    }
});

const statsGraphTemplate = `<canvas id="graph" width="400" height="400">no canvas 4 u</canvas>`;
Vue.component('stats-graph', {
    template: statsGraphTemplate,
    props: ['siteData'],
    data: function() {
        return {
            graphData: this.siteData
        };
    },
    mounted: function() {
        const ctx = document.getElementById('graph').getContext('2d');
        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
                datasets: [{
                    label: '# of Votes',
                    data: [12, 19, 3, 5, 2, 3],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]},
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        }
                    }]
                }
            }
        });
    }
});
const statsBodyTemplate =
`<div>
    <div class="siteUrl">
        <input type="text" class="siteInput" placeholder="google.com" v-model="site.url">
    </div>
    <div class="body-wrapper">
        <div class="graph">
            <stats-graph :siteData="site"/>
        </div>
        <div class="siteInfo">
            <ul>
                <li v-for="point in site.data">
                    <p>{{ point.text }}</p>
                </li>
            </ul>
        </div>
    </div>
</div>`;
Vue.component('stats-body', {
    template: statsBodyTemplate,
    props: ['bodySite'],
    data: function() {
        return {
            site: this.bodySite
        };
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
            url: 'http://google.com',
            data: [
                { code: 404, text: 'down', time: 1499106002921},
                { code: 202, text: 'up', time: 1499106009326}
            ]
        }
    }
});