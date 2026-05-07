const ASTParser = require('./ast-engine/ASTParser');
const IncrementalIndexer = require('./ast-engine/IncrementalIndexer');
const SymbolStorage = require('./ast-engine/SymbolStorage');
const SourceController = require('./ast-engine/SourceController');
const StaticValidator = require('./ast-engine/StaticValidator');
const RuntimeValidator = require('./ast-engine/RuntimeValidator');
const WebSpecs = require('./ast-engine/WebSpecs');
const { AIConnector, DeepSeekProvider, OpenAIProvider, MockProvider } = require('./ai-engine/AIConnector');
const ContextManager = require('./ai-engine/ContextManager');
const CodeGenerator = require('./ai-engine/CodeGenerator');
const CodeMerger = require('./ai-engine/CodeMerger');
const CodeSlicer = require('./ai-engine/CodeSlicer');

module.exports = {
  ASTParser,
  IncrementalIndexer,
  SymbolStorage,
  SourceController,
  StaticValidator,
  RuntimeValidator,
  WebSpecs,
  AIConnector,
  DeepSeekProvider,
  OpenAIProvider,
  MockProvider,
  ContextManager,
  CodeGenerator,
  CodeMerger,
  CodeSlicer
};
