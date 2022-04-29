<?php
/*
 * @Author: witersen
 * @Date: 2022-04-29 19:17:37
 * @LastEditors: witersen
 * @LastEditTime: 2022-04-29 20:09:46
 * @Description: QQ:1801168257
 */

function CheckArrayColumn($checkedArray, $column)
{
    foreach ($column as $value) {
        if (!array_key_exists($value, $checkedArray)) {
            return false;
        }
        if (trim($checkedArray[$value]) == '') {
            return false;
        }
    }
    return true;
}
