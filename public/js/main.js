const footerTemplate = `
<div class="app-footer">
    <p>test</p>
    <p>test2</p>
</div>
`;

Vue.component("app-footer", {
    template: footerTemplate,
});

const menuItem = `
<div class="dropdown-text" v-on:mouseenter="active=true" v-on:mouseleave="active=false" v-show="shown">
    <h1 :class="{ 'active': active, 'inactive': !active }">{{ text }}</h1>
</div>
`;

Vue.component("menu-item", {
    props: ["shown", "text"],
    data: function() {
        return {
            active: false,
        };
    },
    template: menuItem,
});

const titleTemplate = `
<div class="titlebar" :class="{ 'scrolled': scrolled, 'not-scrolled': !scrolled }">
    <div class="button" v-on:scroll="testScroll()" v-on:mouseenter="focus(index)" v-on:mouseleave="leave(index)" v-for="(item, index) in menuItems">
        <a class="embed-link" :href="item.href" v-if="item.href">
            <h1 class="menu-text" v-bind:class="{ 'active': item.active, 'inactive': !item.active }">{{ item.text }}</h1>
        </a>
        <h1 v-else class="menu-text" v-bind:class="{ 'active': item.active, 'inactive': !item.active }">{{ item.text }}</h1>
        <template v-for="sub in item.subMenu">
            <a class="embed-link" :href="sub.href" v-if="sub.href">
                <menu-item :text="sub.text" :shown="item.active"></menu-item>
            </a>
            <div class="embed-link" v-else>
                 <menu-item :text="sub.text" :shown="item.active"></menu-item>
            </div>
        </template>
    </div>
</div>
`;

Vue.component("title-bar", {
    props: {
        initialMenuItems: {
            type: Array,
            default: [
                { text: "kek A", href: "http://google.com", active: false, subMenu: 
                    [{ text: "hi1" }, { text: "hi2" }] },
                { text: "kek B", href: "http://google.com", active: false, subMenu: 
                    [{ text: "hi1" }, { text: "hi2" }] },
                { text: "kek C", href: "http://google.com", active: false, subMenu: 
                    [{ text: "hi1" }, { text: "hi2" }] }
            ],
        },
    },
    template: titleTemplate,
    data: function() {
        return {
            scrolled: false,
            menuItems: this.initialMenuItems,
        };
    },
    methods: {
        focus: function(index) {
            this.menuItems[index].mouseOn = true;
            this.menuItems.forEach((on) => { on.active = false });
            this.menuItems[index].active = true;
        },
        leave: function(index) {
            this.menuItems[index].mouseOn = false;
            setTimeout(() => {
                if (this.menuItems[index].active && !this.menuItems[index].mouseOn)
                    this.menuItems[index].active = false;
            }, 500);
        },
        testScroll: function() {
            this.scrolled = window.scrollY > 0;
        },
    },
    mounted: function() {
        this.$nextTick(function () {
            window.addEventListener('scroll', this.testScroll);
        });
    },
});

const demoTemplate = `
<div class="demo">
    <h2>{{ text }}</h2>
    <input v-model="text">
    <button v-on:click="text = text.split('').reverse().join('')">Reverse</button>
</div>
`;

Vue.component("demo", {
    props: ["initialText"],
    data: function() { return { text: this.initialText }; },
    template: demoTemplate,
});

const contentTemplate = `
<div class="content">
    <demo v-bind:initial-text="demoText"></demo>
    <template v-for="item in textList">
        <li v-bind:card="item">{{ item.text }}</li>
        <input v-model="item.text"></input>
    </template>
</div>
`;

Vue.component("app-content", {
    template: contentTemplate,
    props: ["initialDemoText", "initialTextList"],
    data: function() {
        return {
            demoText: this.initialDemoText,
            textList: this.initialTextList,
        };
    },
});

const app = new Vue({
    el: "#app",
    data: {
        titleList: [
            { text: "1", active: false, mouseOn: false, subMenu: [
                { text: "sub1", href: "http://google.com" },
                { text: "sub2" },
                { text: "sub3" }
            ]},
            { text: "2", active: false, mouseOn: false, subMenu: [
                { text: "sub4" },
                { text: "sub5" },
                { text: "sub6" }
            ]},
            { text: "3", active: false, mouseOn: false, subMenu: [
                { text: "sub7" },
                { text: "sub8" },
                { text: "sub9" },
                { text: "sub10" },
            ]},
        ],
        textList: [
            { text: "Asah, dude. 1" },
            { text: "Asah, dude. 2" },
            { text: "Asah, dude. 3" },
            { text: "Asah, dude. 4" },
            { text: "Asah, dude. 6" },
            { text: "Asah, dude. 7" },
            { text: "Asah, dude. 8" },
            { text: "Asah, dude. 9" },
            { text: "Asah, dude. 10" },
            { text: "Asah, dude. 11" },
            { text: "Asah, dude. 12" },
            { text: "Asah, dude. 13" },
            { text: "Asah, dude. 14" },
            { text: "Asah, dude. 15" },
            { text: "Asah, dude. 16" },
            { text: "Asah, dude. 17" },
            { text: "Asah, dude. 18" },
        ],
        demoText: "Hello.",
    },
});