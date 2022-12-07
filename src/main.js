import Vue from 'vue'
import App from './App.vue'
import VueRouter from "vue-router";
import router from "@/router";
import store from "@/store";
import {
    Container,
    Row,
    Col,
    Header,
    Footer,
    Main,
    Breadcrumb,
    BreadcrumbItem,
    Icon,
    Divider,
    Button,
    Tabs,
    TabPane,
    Aside,
    Steps,
    Step,
    Input,
    Form,
    FormItem,
    MessageBox,
    Message,
    Slider,
    InputNumber,
    Image,
    Radio,
    RadioGroup, Notification, ButtonGroup
} from "element-ui";

Vue.config.productionTip = false
Vue.use(VueRouter);
Vue.use(Container);
Vue.use(Row);
Vue.use(Col);
Vue.use(Header);
Vue.use(Footer);
Vue.use(Main);
Vue.use(Breadcrumb);
Vue.use(BreadcrumbItem)
Vue.use(Icon);
Vue.use(Divider);
Vue.use(Button);
Vue.use(Tabs);
Vue.use(TabPane);
Vue.use(Aside);
Vue.use(Step);
Vue.use(Steps);
Vue.use(Input);
Vue.use(FormItem);
Vue.use(Form);
Vue.use(Slider);
Vue.use(InputNumber);
Vue.use(Image);
Vue.use(RadioGroup);
Vue.use(Radio);
Vue.use(ButtonGroup)
new Vue({
    render: h => h(App),
    router,
    store,
    beforeCreate() {
        // 全局事件总线
        Vue.prototype.$bus = this;
        Vue.prototype.$confirm = MessageBox.confirm;
        Vue.prototype.$message = Message;
        Vue.prototype.$notify = Notification;
    }
}).$mount('#app')
