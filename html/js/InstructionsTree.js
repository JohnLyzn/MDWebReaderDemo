define(function() {
	const INSTRUCTION_TREE = {
		'INSTALL_TOOLNODE': {
			'rootPath': 'steps/installToolNode',
			'title': '安装工具节点',
			'description': '描述...',
			'steps': [{
				'title': '安装环境',
				'mdFileName': 'step1.md',
				'description': '提供Linux基本环境运行吾托帮组件'
			},{
				'title': '步骤2',
				'mdFileName': 'step2.md',
				'description': '2'
			}]
		}
	};
	return INSTRUCTION_TREE;
});
