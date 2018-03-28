define(['jquery', 'markdown'], 
	function($, markdown) {
		function InstructionsMDRender(config, instructionTree) {

			var _assertTrue = function(target, errorMsg) {
		 		if(! target) {
		 			throw new Error(errorMsg);
		 		}
		 	};

			var _assertIsStr = function(target, errorMsg) {
		 		if(typeof target != 'string') {
		 			throw new Error(errorMsg);
		 		}
		 	};

			var _assertIsObj = function(target, errorMsg) {
		 		if(typeof target != 'object') {
		 			throw new Error(errorMsg);
		 		}
		 	};

		 	var _assertIsFunc = function(target, errorMsg) {
		 		if(typeof target != 'function') {
		 			throw new Error(errorMsg);
		 		}
		 	};

		 	var _fetchMDFileContentByFilePath = function($input, path, success) {
		 		$input.off('change');
		 		$input.on('change', function() {
		 			var files = $input[0].files;
		 			if (files.length) {
			            var file = files[0];
			            var reader = new FileReader();//new一个FileReader实例
		                reader.onload = function() {
		                	var data = this.result;
		                	if(! data) {
			 					error(data);
			 				}
			 				success(data);
		                }
		                reader.onerror = function() {
		                	error(null);
		                }
		                reader.readAsText(file);
		        	}
		 		});
		 	};

		 	var _fetchMDFileContentByUrl = function(url, success, error) {
		 		$.ajax({
		 			'url': url,
		 			'type': 'text',
		 			'success': function(data) {
		 				if(! data) {
		 					error(data);
		 				}
		 				success(data);
		 			},
		 			'error': function() {
		 				error(null);
		 			}
		 		});
		 	};

		 	var _fetchMDFileContent = function(url, success, error) {
		 		if(/file:.*/.test(url)) {
		 			var $input = $(config.$fileInput);
		 			if($input.length == 0) {
		 				throw new Error('本地文件加载必须指定输入文件的input节点, 即配置项$fileInput不能为');
		 			}
		 			$input.show();
		 			_fetchMDFileContentByFilePath($input, url, success, error);
		 		} else if(/https?.*/.test(url)) {
		 			$(config.$fileInput).hide();
		 			_fetchMDFileContentByUrl(url, success, error);
		 		}
		 	};

			var _loadMarkDownFile = function(name, index) {
				_assertTrue(! isFeting, '正在操作中, 不要重复点击!');
		 		var stepsConfig = instructionTree[name];
				_assertIsObj(stepsConfig, '不存在配置名称为' + name + '的说明书');
				_assertIsObj(stepsConfig.steps[index], '名称为' + name + '的说明书' + '不存在第' + (index + 1) + '页');
				var stepsCache = cache[name];
				if(! stepsCache || ! stepsCache[index]) {
					var baseUrl = config.baseUrl;
					var fileRootPath = stepsConfig.rootPath;
					var stepConfig = stepsConfig.steps[index];
					var fileName = stepConfig.mdFileName;

					var url = baseUrl + '/' + fileRootPath + '/' + fileName;
					isFeting = true;
					_fetchMDFileContent(url, function(fileContent) {
						var html = markdown.toHTML(fileContent);

						currentName = name;
						currentTotalStep = stepsConfig.steps.length;
						currentStep = index;

						if(! stepsCache) {
							cache[name] = {};

							config.onNewInstruction && config.onNewInstruction(currentName,
							 currentTotalStep, stepsConfig.title, stepsConfig.description);
						}

						cache[name][index] = html;

						config.onNewStep && config.onNewStep(html, currentStep + 1,
						 currentTotalStep, stepConfig.title, stepConfig.description);

						isFeting = false;
					}, function(data) {
						config.onError && config.onError(url, data);

						isFeting = false;
					});
				} else {
					var html = cache[name][index];
					var stepConfig = stepsConfig.steps[index];
					config.onNewStep && config.onNewStep(html, currentStep + 1,
					 currentTotalStep, stepConfig.title, stepConfig.description);
				}
		 	};

		 	if(! $) {
		 		throw new Error('需要依赖jQuery!');
		 	}
		 	if(! markdown) {
		 		throw new Error('需要依赖Markdown.js!');
		 	} 
		 	_assertIsObj(instructionTree, '需要指定说明书配置数据!');

		 	var cache = {};
		 	var isFeting = false;
		 	var currentStep = 0;
		 	var currentTotalStep = 0;
		 	var currentName = null;

		 	this.load = function(name) {
		 		_loadMarkDownFile(name, 0);
		 	};

		 	this.getTotalStep = function() {
		 		return currentTotalStep;
		 	};

		 	this.getCurrentStep = function() {
		 		return currentStep + 1;
		 	};

		 	this.hasNextStep = function() {
		 		return currentStep < currentTotalStep - 1;
		 	};

		 	this.nextStep = function() {
		 		if(currentStep >= currentTotalStep) {
		 			return;
		 		}
		 		currentStep ++;
		 		_loadMarkDownFile(currentName, currentStep);
		 	};

		 	this.gotoStep = function(step) {
		 		if(step < 1 || step > currentTotalStep) {
		 			throw new Error('不存在对应该索引的步骤!');
		 		}
		 		_loadMarkDownFile(currentName, step --);
		 	};

		 	this.hasPreviousStep = function() {
		 		return currentStep > 0;
		 	};

		 	this.previousStep = function() {
		 		if(currentStep <= 0) {
		 			return;
		 		}
		 		currentStep --;
		 		_loadMarkDownFile(currentName, currentStep);
		 	};
		}
		return InstructionsMDRender; 
	}
);