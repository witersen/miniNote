<?php
/*
 * @Author: witersen
 * @Date: 2022-04-29 19:17:37
 * @LastEditors: witersen
 * @LastEditTime: 2022-04-29 20:11:00
 * @Description: QQ:1801168257
 */

ini_set('display_errors', 1);
error_reporting(E_ALL);

define('BASE_PATH', __DIR__);

date_default_timezone_set('PRC');

require_once BASE_PATH . '/app/core/controller.class.php';

/**
 * token
 */
$GlobalToken = isset($_SERVER['HTTP_TOKEN']) ? $_SERVER['HTTP_TOKEN'] : '';
define('GlobalToken', $GlobalToken);

/**
 * 控制器
 */
$controller_perifx = isset($_GET['c']) ? $_GET['c'] : ''; //控制器前缀
$controller_name = $controller_perifx . '.class'; //控制器名称
$controller_path = BASE_PATH . '/app/controller/' . $controller_name . '.php'; //控制器路径

/**
 * 方法
 */
$GlobalAction = isset($_GET['a']) ? $_GET['a'] : '';
define('GlobalAction', $GlobalAction);


/**
 * 接口类型
 * 小程序还是web系统
 */
$type = isset($_GET['t']) ? $_GET['t'] : '';
define('GlobalType', $type);

/**
 * 请求参数即Request Payload
 * 适用请求方式 json
 * Content-Type: application/json
 */
$requestPayload = file_get_contents("php://input");
$requestPayload = !empty($requestPayload) ? json_decode($requestPayload, true) : array();

/**
 * 获取文件信息
 * 适用请求方式 fordata
 * Content-Type: multipart/form-data;
 * 
 * 示例数据
 * 其中 file 为前端请求的自定义字段 使用时候要自行判断是否存在该键值
 * {
 * 	"file": {
 * 		"name": "tmp_bda9c778201ffb47ebfea61617a16d1c564ca6d0b8ad52b8.jpg",
 * 		"type": "image\/jpeg",
 * 		"tmp_name": "\/tmp\/phpwxfAaU",
 * 		"error": 0,
 * 		"size": 166881
 * 	}
 * }
 */
define('GlobalFile', $_FILES);

/**
 * 获取表单提交字段
 * 适用请求方式 fordata
 * Content-Type: multipart/form-data;
 */
define('GlobalPost', $_POST);

/**
 * 检查控制器和方法是否存在并实例化
 */
if (file_exists($controller_path)) {
    $controller = new $controller_perifx();
    if (is_callable(array($controller, $GlobalAction))) {
        //检查token
        $obj = new Controller();
        if (!$obj->PreHandler()) {
            echo json_encode(array(
                'status' => '0',
                'code' => '401',
                'message' => 'token无效'
            ));
            return;
        }
        //业务
        echo json_encode($controller->$GlobalAction($requestPayload));
    }
}
