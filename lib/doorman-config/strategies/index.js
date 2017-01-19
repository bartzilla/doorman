module.exports = {
  // LoadEnvConfigStrategy: require('./LoadEnvConfigStrategy'),
  NullConfigStrategy: require('./NullConfigStrategy'),
  ExtendConfigStrategy: require('./ExtendConfigStrategy'),
  // LoadWebAuthConfigStrategy: require('./LoadWebAuthConfigStrategy'),
  EnrichIntegrationFromRemoteConfigStrategy: require('./EnrichIntegrationFromRemoteConfigStrategy'),
  EnrichClientFromRemoteConfigStrategy: require('./EnrichClientFromRemoteConfigStrategy'),
  EnrichClientConfigStrategy: require('./EnrichClientConfigStrategy'),
  LoadFileConfigStrategy: require('./LoadFileConfigStrategy')
};