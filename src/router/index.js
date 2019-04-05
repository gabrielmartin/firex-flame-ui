import Vue from 'vue';
import Router from 'vue-router';
import XParent from '@/components/XParent.vue';
import XHeaderedGraph from '@/components/XHeaderedGraph.vue';
import XList from '@/components/XList.vue';
import XNodeAttributes from '@/components/XNodeAttributes.vue';
import _ from 'lodash';
import XHelp from '@/components/XHelp.vue';
import XSettings from '@/components/XSettings.vue';
import XShortcuts from '@/components/XShortcuts.vue';

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/',
      component: XParent,
      props: route => ({ inputLogDir: route.query.logDir, flameServer: route.query.flameServer }),
      children: [
        {
          path: 'list',
          name: 'XList',
          component: XList,
          props: true,
        },
        {
          path: 'tasks/:uuid',
          name: 'XNodeAttributes',
          component: XNodeAttributes,
          props: true,
        },
        {
          path: 'root/:rootUuid',
          name: 'custom-root',
          component: XHeaderedGraph,
          props: true,
        },
        {
          path: 'help',
          name: 'XHelp',
          component: XHelp,
          props: true,
        },
        {
          path: 'shortcuts',
          name: 'XShortcuts',
          component: XShortcuts,
          props: true,
        },
        // default path must be last.
        {
          path: '',
          name: 'XGraph',
          component: XHeaderedGraph,
          props: true,
        },
      ],
    },
    {
      path: '/settings',
      component: XSettings,
    },
  ],
  // always scroll to top.
  scrollBehavior() {
    return { x: 0, y: 0 };
  },
});

// TODO: doesn't affect clicking to open a new tab.
router.beforeEach((to, from, next) => {
  // By default, keep the current logDir & flameServer. These are the central key by which data
  // is fetched.
  const keptQuery = {};
  if (from.query.logDir && !to.query.logDir) {
    keptQuery.logDir = from.query.logDir;
  }
  if (from.query.flameServer && !to.query.flameServer) {
    keptQuery.flameServer = from.query.flameServer;
  }

  if (!_.isEmpty(keptQuery)) {
    const newTo = _.clone(to);
    newTo.query = _.assign({}, newTo.query, keptQuery);
    next(newTo);
  } else {
    next();
  }
});

export default router;
