out/showTree.js: src/simpleFormat.js
out/showTree2.js: src/algebraicFormat.js


out/showTreePretty.js: src/efficientPretty.js

out/showXML.js: src/efficientPretty.js src/utils.js

out/%.js: src/%.js
	yarn babel --silent -- src -d out

run-tree: out/showTree.js
	node $<

run-tree2: out/showTree2.js
	node $<

run-tree-pretty: out/showTreePretty.js
	node $< 10

run-xml: out/showXML.js
	node $< 10
