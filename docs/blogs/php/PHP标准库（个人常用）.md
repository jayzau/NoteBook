# PHP标准库（个人常用）

## 字符串相关

- **bin2hex** ( string `$str` ) : string

  ...

---

## 数组相关

-  **array_change_key_case** ( array `$array` , int `$case` = CASE_LOWER ) : array

  将数组`key`改为全大写/小写。

  ```php
  // const
  CASE_LOWER = 0
  CASE_UPPER = 1
  ```

- **array_chunk** ( array `$array` , int `$size` , bool `$preserve_keys` = false ) : array

  数组按`size`切割。

  `preserve_keys`：设为 **true**，可以使 PHP 保留输入数组中原来的键名。如果你指定了 **false**，那每个结果数组将用从零开始的新数字索引。默认值是 **false**。

- **array_column** ( array `$input` , [mixed](https://www.php.net/manual/zh/language.types.declarations.php#language.types.declarations.mixed) `$column_key` , [mixed](https://www.php.net/manual/zh/language.types.declarations.php#language.types.declarations.mixed) `$index_key` = null ) : array

  返回数组中指定的一列，比较强大。

  [链接](<https://www.php.net/manual/zh/function.array-column.php>)

- **array_combine** ( array `$keys` , array `$values` ) : array

  键值对组合。

  python释义：`array_combine(keys: list, values: list) => {key0: value0, ...}`

- **array_count_values** ( array `$array` ) : array

  以`value`为键统计`value`出现的次数：`[value0 => 1, value1 => 2, ...]`

- **array_diff*** ( array `$array1` , array `$array2` , array `$...` = ? ) : array

  数组比对。返回在`array1`出现并且未在其余数组中出现的数据。

  - **array_diff_assoc**：比较键和值。
  - **array_diff_key**：只比较键。
  - **array_diff**：只比较值。

- **array_intersect*** ( array `$array1` , array `$array2` , array `$...` = ? ) : array

  数组比对。返回在`array1`出现并且也在其余数组中出现的数据。

  - **array_intersect_assoc**：比较键和值。
  - **array_intersect_key**：只比较键。
  - **array_intersect**：只比较值。

- **array_fill_keys** ( array `$keys` , [mixed](https://www.php.net/manual/zh/language.types.declarations.php#language.types.declarations.mixed) `$value` ) : array

  使用 `value` 参数的值作为值，使用 `keys` 数组的值作为键来填充一个数组。

  给数组添加默认值可用。

- **array_filter** ( array `$array` , [callable](https://www.php.net/manual/zh/language.types.callable.php)|null `$callback` = **null** , int `$mode` = 0 ) : array

  ```php
  array_filter($array1, function ($value) {return true;});
  array_filter($array1, function ($value, $key) {return true;}, ARRAY_FILTER_USE_BOTH);
  array_filter($array1, function ($key) {return true;}, ARRAY_FILTER_USE_KEY);
  ```

- **array_flip** ( array `$array` ) : array

  键值反转。

- **array_key_exists** ( [mixed](https://www.php.net/manual/zh/language.types.declarations.php#language.types.declarations.mixed) `$key` , array `$array` ) : bool

  同：**key_exists**

  **查值**：**in_array** ( [mixed](https://www.php.net/manual/zh/language.types.declarations.php#language.types.declarations.mixed) `$needle` , array `$haystack` , bool `$strict` = **false** ) : bool

- **array_key_first** ( array `$array` ) : [mixed](https://www.php.net/manual/zh/language.types.declarations.php#language.types.declarations.mixed)

- **array_key_last** ( array `$array` ) : [mixed](https://www.php.net/manual/zh/language.types.declarations.php#language.types.declarations.mixed)

- **array_keys** ( array `$array` , [mixed](https://www.php.net/manual/zh/language.types.declarations.php#language.types.declarations.mixed) `$search_value` = null , bool `$strict` = false ) : array

  `search_value`：如果指定了这个参数，只有包含这些值的键才会返回。

  `strict`：判断在搜索的时候是否该使用严格的比较（===）。

  **坑**：PHP中，`"string" == 0`为`true`。`echo true`输出为`1`，但是`echo false`输出为空。

  ```php
  // Core_d.php
  define ('true', (bool)1, true);
  define ('false', (bool)0, true);
  ```

  **原理**：用`==`符做字符串与整型的比较时，会将字符串先转换为整型再做比较。如：`"string" = 0`，`"10int" = 10`。

  **二坑**：如上转换可以使用`intval`函数达到相同的效果。`intval(array())`值为`0`，但`intval(array()) == 0`结果为`false`，此时并未进行类型转换？

  **原理**：[链接](https://www.runoob.com/wp-content/uploads/2019/05/1791863413-572055b100304_articlex.png)

- **array_values** ( array `$array` ) : array

- **array_map** ( [callable](https://www.php.net/manual/zh/language.types.callable.php) `$callback` , array `$array` , array `...$arrays` ) : array

- **array_merge** ( array `$...` = ? ) : array

  递归版本：**array_merge_recursive** ( array `$...` = ? ) : array

- **array_pad** ( array `$array` , int `$size` , [mixed](https://www.php.net/manual/zh/language.types.declarations.php#language.types.declarations.mixed) `$value` ) : array

  数组填补：`size`为填补后数组的长度，负数左侧填补，正数右侧填补。`value`为填补值。

- **array_pop** ( array `&$array` ) : [mixed](https://www.php.net/manual/zh/language.types.declarations.php#language.types.declarations.mixed)

- **array_shift** ( array `&$array` ) : [mixed](https://www.php.net/manual/zh/language.types.declarations.php#language.types.declarations.mixed)

  从左侧弹出。

- **array_product** ( array `$array` ) : number

  数组中所有值的乘积。

  **相加**：**array_sum** ( array `$array` ) : number

- **array_push** ( array `&$array` , [mixed](https://www.php.net/manual/zh/language.types.declarations.php#language.types.declarations.mixed) `$value1` , [mixed](https://www.php.net/manual/zh/language.types.declarations.php#language.types.declarations.mixed) `$...` = ? ) : int

  **注意**：若`value`只有一个，还不如直接使用`$array[] = `。

  **从左添加**：**array_unshift** ( array `&$array` , [mixed](https://www.php.net/manual/zh/language.types.declarations.php#language.types.declarations.mixed) `...$values` ) : int

- **array_rand** ( array `$array` , int `$num` = 1 ) : int|string|array

  （伪）随机取一个或多个数组中的`key`。

- **array_reduce** ( array `$array` , [callable](https://www.php.net/manual/zh/language.types.callable.php) `$callback` , [mixed](https://www.php.net/manual/zh/language.types.declarations.php#language.types.declarations.mixed) `$initial` = **null** ) : [mixed](https://www.php.net/manual/zh/language.types.declarations.php#language.types.declarations.mixed)

  **callback**：callback ( [mixed](https://www.php.net/manual/zh/language.types.declarations.php#language.types.declarations.mixed) `$carry` , [mixed](https://www.php.net/manual/zh/language.types.declarations.php#language.types.declarations.mixed) `$item` ) : [mixed](https://www.php.net/manual/zh/language.types.declarations.php#language.types.declarations.mixed)

  **initial**：`$carry`初始填补值。

- **array_replace** ( array `$array` , array `$replacements` = ? ) : array

  递归版本：**array_replace_recursive** ( array `$array1` , array `$...` = ? ) : array

- **array_reverse** ( array `$array` , bool `$preserve_keys` = **false** ) : array

- **array_search** ( [mixed](https://www.php.net/manual/zh/language.types.declarations.php#language.types.declarations.mixed) `$needle` , array `$haystack` , bool `$strict` = false ) : [mixed](https://www.php.net/manual/zh/language.types.declarations.php#language.types.declarations.mixed)

  只返回首个匹配项`key`值，匹配所有用`array_keys()`。

- **array_slice** ( array `$array` , int `$offset` , int `$length` = **null** , bool `$preserve_keys` = **false** ) : array

- **array_unique** ( array `$array` , int `$sort_flags` = SORT_STRING ) : array

  python释义：`set().add()`

- **array_walk** ( array `&$array` , [callable](https://www.php.net/manual/zh/language.types.callable.php) `$callback` , [mixed](https://www.php.net/manual/zh/language.types.declarations.php#language.types.declarations.mixed) `$userdata` = **null** ) : bool

  递归版本：**array_walk_recursive** ( array `&$array` , [callable](https://www.php.net/manual/zh/language.types.callable.php) `$callback` , [mixed](https://www.php.net/manual/zh/language.types.declarations.php#language.types.declarations.mixed) `$userdata` = **null** ) : bool

  典型情况下 `callback` 接受两个参数。`array` 参数的值作为第一个，键名作为第二个。

- **排序：**

  - **rsort** ( array `&$array` , int `$sort_flags` = SORT_REGULAR ) : bool

    python释义：`list().sort(reverse=True)`

    **正向**：**sort** ( array `&$array` , int `$sort_flags` = SORT_REGULAR ) : bool

  - **arsort** ( array `&$array` , int `$sort_flags` = SORT_REGULAR ) : bool

    **正向**：**asort** ( array `&$array` , int `$sort_flags` = SORT_REGULAR ) : bool

    **注意**：索引不变。

  - **krsort** ( array `&$array` , int `$sort_flags` = SORT_REGULAR ) : bool

    按`key`逆向排序。

    **正向**：**ksort** ( array `&$array` , int `$sort_flags` = SORT_REGULAR ) : bool

  - **natsort** ( array `&$array` ) : bool

    自然排序：一个和人们通常对字母数字字符串进行排序的方法一样的排序算法并保持原有键／值的关联，这被称为“自然排序”。

    **不区分大小写**：**natcasesort** ( array `&$array` ) : bool

  自定义比较函数：**uasort** , **uksort** , **usort** 。

- **shuffle** ( array `&$array` ) : bool

  打乱数组。

- **compact** ( [mixed](https://www.php.net/manual/zh/language.types.declarations.php#language.types.declarations.mixed) `$var_name` , [mixed](https://www.php.net/manual/zh/language.types.declarations.php#language.types.declarations.mixed) `...$var_names` ) : array

  创建一个包含变量与其值的数组。

  `var_name`为变量名的字符串形式。

  **类似**：**list** ( [mixed](https://www.php.net/manual/zh/language.types.declarations.php#language.types.declarations.mixed) `$var` , [mixed](https://www.php.net/manual/zh/language.types.declarations.php#language.types.declarations.mixed) `...$vars` = ? ) : array

  **区别**：

  ```php
  <?php
  
  $values = array(
      "Jay",
      "Jone",
      "Joe"
  );
  
  list($jay, $jone, $joe) = $values;
  
  $joanna = "Joanna";
  $jessie = "Jessie";
  $jamie = "Jamie";
  
  $female = compact("joanna", "jessie", "jamie");
  
  var_dump($jay);
  var_dump($jone);
  var_dump($joe);
  var_dump($female);
  
  /*
   * string(3) "Jay"
   * string(4) "Jone"
   * string(3) "Joe"
   * array(3) {
   *     ["joanna"]=>
   *   string(6) "Joanna"
   *     ["jessie"]=>
   *   string(6) "Jessie"
   *     ["jamie"]=>
   *   string(5) "Jamie"
   * }
   */
  ```

- **count** ( [mixed](https://www.php.net/manual/zh/language.types.declarations.php#language.types.declarations.mixed) `$array_or_countable` , int `$mode` = COUNT_NORMAL ) : int

  `mode = COUNT_RECURSIVE`：递归的计数。

  别名：**sizeof**

- **current** ( array|object `$array` ) : [mixed](https://www.php.net/manual/zh/language.types.declarations.php#language.types.declarations.mixed)

  别名：**pos**

  相似：

  - **next** ( array `&$array` ) : [mixed](https://www.php.net/manual/zh/language.types.declarations.php#language.types.declarations.mixed)
  - **prev** ( array `&$array` ) : [mixed](https://www.php.net/manual/zh/language.types.declarations.php#language.types.declarations.mixed)
  - **reset** ( array `&$array` ) : [mixed](https://www.php.net/manual/zh/language.types.declarations.php#language.types.declarations.mixed)
  - **end** ( array `&$array` ) : [mixed](https://www.php.net/manual/zh/language.types.declarations.php#language.types.declarations.mixed)
  - **key** ( array `$array` ) : [mixed](https://www.php.net/manual/zh/language.types.declarations.php#language.types.declarations.mixed)

  示例：

  ```php
  <?php
  
  $arr1 = array(
      "Jay",
      "Jone",
      "Joe"
  );
  
  // 初始状态下指向第一个单元
  var_dump(prev($arr1));    // 越界
  var_dump(next($arr1));
  var_dump(reset($arr1));   // 重新指向第一个单元
  var_dump(next($arr1));
  var_dump(current($arr1));
  var_dump(end($arr1));     // 指向最后一个单元
  var_dump(next($arr1));    // 越界
  var_dump(prev($arr1));
  var_dump(end($arr1));     // 重新指向最后一个单元
  var_dump(prev($arr1));
  var_dump(current($arr1));
  
  /*
   * bool(false)
   * bool(false)
   * string(3) "Jay"
   * string(4) "Jone"
   * string(4) "Jone"
   * string(3) "Joe"
   * bool(false)
   * bool(false)
   * string(3) "Joe"
   * string(4) "Jone"
   * string(4) "Jone"
   */
  ```

---

