require.config({
    paths: {
        'jquery': 'lib/jquery-3.2.1.min',
        'markdown': '../other/markdown/markdown',
        'parser': '../other/markdown/parser',
        'core': '../other/markdown/core',
        'markdown_helpers': '../other/markdown/markdown_helpers',
        'render_tree': '../other/markdown/render_tree',
        'dialects/gruber': '../other/markdown/dialects/gruber',
        'dialects/maruku': '../other/markdown/dialects/maruku',
        'dialects/dialect_helpers': '../other/markdown/dialects/dialect_helpers',
        'InstructionsMDReader': 'InstructionsMDReader',
        'InstructionsTree': 'InstructionsTree'
    }
 });
require(['jquery', 'InstructionsMDReader', 'InstructionsTree'], 
	function ($, InstructionsMDReader, INSTRUCTIONS_TREE) {
	    $(function() {
	    	var baseUrl = window.location.href.substring(0, window.location.href.match(/\w+\.\w+/).index);
	    	var $instructionTitle = $('#instructionTitle');
	    	var $instructionStepIndex = $('#instructionStep span:eq(0)');
	    	var $instructionStepTitle = $('#instructionStep span:eq(1)');
	    	var $renderNode = $('#stepDetailView');
	    	var $stepBtns = $('.idp-i-nav .btn');
	    	var $nextStepBtn = $($stepBtns[0]);
	    	var $prevStepBtn = $($stepBtns[1]);
	    	var $progressIndicator = $('#progressIndicator');
	    	var $currentStepSpan = $('#currentStep');
	    	var $totalStepSpan = $('#totalStep');

	    	var instructionNames = [];
	    	for(var instructionName in INSTRUCTIONS_TREE) {
	    		instructionNames.push(instructionName);
	    	}
			var imdRender = new InstructionsMDReader({
				'baseUrl': baseUrl,
				'$fileInput': $('.idp-i-title input'),
				'onNewInstruction': function(name, total, title, description) {
					$totalStepSpan.text(total);
					$instructionTitle.text(title);
					$instructionTitle.attr('title', description);
				},
				'onNewStep': function(html, step, total, title, description) {
					$renderNode.empty();
					$renderNode.html(html);

					$stepBtns.css('visibility', 'visible');
					if(! imdRender.hasNextStep()) {
						$nextStepBtn.css('visibility', 'hidden');
					}
					if(! imdRender.hasPreviousStep()) {
						$prevStepBtn.css('visibility', 'hidden');
					}

					$instructionStepIndex.text(step);
					$instructionStepTitle.text(title);
					$instructionStepTitle.attr('title', description);
					$progressIndicator.css('width', (step / total * 100) + '%' );
					$currentStepSpan.text(step);
				},
				'onError': function(url, data) {
					throw new Error('从地址' + url + '获取不到正确的MarkDown文件数据!当前为' + data);
				}
			}, INSTRUCTIONS_TREE);
			imdRender.load(instructionNames[0]);

			window.nextStep = function() {
				imdRender.nextStep();
			};

			window.prevStep = function() {
				imdRender.previousStep();
			};
		});
	}
);
