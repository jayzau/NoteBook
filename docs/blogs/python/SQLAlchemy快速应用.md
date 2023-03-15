
## SQLAlchemy 

推荐书籍：`SQLAIchemy：Python数据库实战`

以前常用的是 `SQLAlchemy ORM`，每次都要新建模型类，虽然定义了模型类会有代码提示，数据上使用类属性也更不容易出错，但是太费时间。

小型脚本图方便图快感觉上还是 `SQLAlchemy Core` + `反射技术` 来得更舒服。

这里更多的是记录 `SQLAlchemy Core` 的一些常用方法。

### 反射技术

使用反射技术可以利用现有数据库填充 SQLAlchemy 对象。你可以运用这种技术反射表、 视图、索引和外键。

--- 

## SQLAlchemy Core

### 数据库连接

```python
from sqlalchemy import create_engine, MetaData, Table

metadata = MetaData()
url = f"mysql+pymysql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_DATABASE}?charset={DB_CHARSET}"
engine = create_engine(url, echo=False)
connection = engine.connect()
```

url规则参考(`create_engine.__doc__`)：

MongoDB: `mongodb://username:password@hostname:port/mydatabase`

PostgreSQL: `postgresql://username:password@hostname:port/mydatabase`

MySQL: `mysql://username:password@hostname:port/mydatabase?ssl=true`

### 反射表

```python
# 反射全部
metadata.reflect(bind=engine)
tables = metadata.tables
table = tables['table_name']
# 单个反射
table = Table('table_name', metadata, autoload=True, autoload_with=engine)

# 别名
table_jz = table.alias('jz')
```

### CRUD

#### 测试表sql

```sql
CREATE TABLE `food_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '自增id',
  `name` varchar(24) NOT NULL COMMENT '类型名称',
  `description` varchar(255) DEFAULT '' COMMENT '描述',
  `created_time` int(10) DEFAULT '0' COMMENT '添加时间',
  `updated_time` int(10) DEFAULT '0' COMMENT '更新时间',
  `deleted_time` int(10) DEFAULT '0' COMMENT '删除时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `food_name` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '自增id',
  `name` varchar(24) NOT NULL COMMENT '类型名称',
  `description` varchar(255) DEFAULT '' COMMENT '描述',
  `created_time` int(10) DEFAULT '0' COMMENT '添加时间',
  `updated_time` int(10) DEFAULT '0' COMMENT '更新时间',
  `deleted_time` int(10) DEFAULT '0' COMMENT '删除时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `food_type_name` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `food_type_id` int(11) NOT NULL,
  `food_name_id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### create

```python
food_type = Table('food_type', metadata, autoload=True, autoload_with=engine)
# 插入单条
ins = food_type.insert().values(name='水果', description='水果，是指多汁且主要味觉为甜味和酸味，可食用的植物果实。')
print('SQL: ', str(ins))    # INSERT INTO table (name, description) VALUES (:name, :description);
print('params: ', ins.compile().params)    # {'name': '水果', 'description': '水果，是指多汁且主要味觉为甜味和酸味，可食用的植物果实。'}
res = connection.execute(ins)
print('Insterted primary key: ', res.inserted_primary_key)
# ------------------------
ins = food_type.insert()
res = connection.execute(
    ins, 
    name='蔬菜',
    description='蔬菜(vegetables)是指可以做菜、烹饪成为食品的一类植物或菌类。'
)
# ------------------------
from sqlalchemy import insert

ins = insert(food_type).values(name='干货', description='干货是指去除了水分或水分较少的初级产品的统称。')
res = connection.execute(ins)

# 插入多条
data_list = [
    {'name': '肉类', 'description': '肉类，是动物的皮下组织及肌肉，可以食用。'},
    {'name': '水产', 'description': '水产是指江、河、湖、海里出产的经济动、植物的统称。'}
]
ins = food_type.insert()
res = connection.execute(ins, data_list)
```

#### read

##### 基本查询 

```python
food_type = Table('food_type', metadata, autoload=True, autoload_with=engine)
# 基本查询
s = food_type.select()
res = connection.execute(s)
results = res.fetchall()
# ------------------------
from sqlalchemy import select

s = select([food_type])
res = connection.execute(s)
results = res.fetchall()
# ------------------------
""" results: typing.List[LegacyRow]
[
    (1, '水果', '水果，是指多汁且主要味觉为甜味和酸味，可食用的植物果实。', 0, 0, 0), 
    (2, '蔬菜', '蔬菜(vegetables)是指可以做菜、烹饪成为食品的一类植物或菌类。', 0, 0, 0), 
    (3, '干货', '干货是指去除了水分或水分较少的初级产品的统称。', 0, 0, 0), 
    (4, '肉类', '肉类，是动物的皮下组织及肌肉，可以食用。', 0, 0, 0), 
    (5, '水产', '水产是指江、河、湖、海里出产的经济动、植物的统称。', 0, 0, 0)
]
"""
# 不同写法 相同结果 ResultProxy
first_row = results[0]
print(first_row[1])    # 水果
print(first_row.name)    # 水果
print(first_row[food_type.c.name])    # 水果

# 推荐方式
# 迭代 ResultProxy： 查询多条
s = food_type.select()
for record in connection.execute(s):
    print(record.name)      # 水果 / 蔬菜 / 干货 / ...
# 查询单条
s = food_type.select()
record = connection.execute(s).first()      # (1, '水果', '水果，是指多汁且主要味觉为甜味和酸味，可食用的植物果实。', 0, 0, 0)
```

##### 查询指定列 SELECT

```python
from sqlalchemy import select

food_type = Table('food_type', metadata, autoload=True, autoload_with=engine)
s = select([food_type.c.name, food_type.c.description])
record = connection.execute(s).first()      # ('水果', '水果，是指多汁且主要味觉为甜味和酸味，可食用的植物果实。')
```

##### 排序 ORDER BY

```python
food_type = Table('food_type', metadata, autoload=True, autoload_with=engine)
s = select([food_type.c.name, food_type.c.description])
s = s.order_by(food_type.c.name)
record = connection.execute(s).first()     # ('干货', '干货是指去除了水分或水分较少的初级产品的统称。')
# 降序
from sqlalchemy import desc

s = select([food_type.c.name, food_type.c.description])
# s = s.order_by(food_type.c.name.desc())   不推荐
s = s.order_by(desc(food_type.c.name))
record = connection.execute(s).first()     # ('蔬菜', '蔬菜(vegetables)是指可以做菜、烹饪成为食品的一类植物或菌类。')
```

##### 数量限制 LIMIT

```python
food_type = Table('food_type', metadata, autoload=True, autoload_with=engine)
s = select([food_type])
s = s.limit(2)
res = connection.execute(s)
results = res.fetchall()
"""
[
    (1, '水果', '水果，是指多汁且主要味觉为甜味和酸味，可食用的植物果实。', 0, 0, 0), 
    (2, '蔬菜', '蔬菜(vegetables)是指可以做菜、烹饪成为食品的一类植物或菌类。', 0, 0, 0)
]
"""
```

##### 分组 GROUP BY

```python
food_type = Table('food_type', metadata, autoload=True, autoload_with=engine)
s = select([food_type.c.name])
s = s.group_by(food_type.c.name)
```

##### 过滤 WHERE

```python
food_type = Table('food_type', metadata, autoload=True, autoload_with=engine)
s = select([food_type])
s = s.where(food_type.c.name == '蔬菜')
r = connection.execute(s)
record = r.first()          # (2, '蔬菜', '蔬菜(vegetables)是指可以做菜、烹饪成为食品的一类植物或菌类。', 0, 0, 0)
# ClauseElement  LIKE
s = select([food_type.c.name])
s = s.where(food_type.c.description.like('%食用%'))
r = connection.execute(s)
records = r.fetchall()      # [('水果',), ('肉类',)]
```

|方法|用途|
|---|---|
between(cleft, cright) |查找在 cleft 和 cright 之间的列 |
concat(column_two) |连接列 |
distinct() |查找列的唯一值 |
in_([list]) |查找列在列表中的位置 |
is_(None) |查找列 None 的位置(通常用于检查 Null 和 None) |
contains(string) |查找包含 string 的列(区分大小写) |
endswith(string) |查找以 string 结尾的列(区分大小写) |
like(string) |查找与 string 匹配的列(区分大小写) |
startswith(string) |查找以 string 开头的列(区分大小写) |
ilike(string) |查找与 string 匹配的列(不区分大小写) |

> 这些方法也存在相反的版本，例如 notlike 和 notin_()。not<方法 > 这种命 名约定的唯一例外是不带下划线的 isnot() 方法。

连接词：

```python
from sqlalchemy import and_, or_, not_

s = select([food_type.c.id])
s = s.where(
    and_(
        or_(
            food_type.c.name == '水果',
            food_type.c.name == '蔬菜',
            food_type.c.name == '肉类'
        ),
        food_type.c.description.contains('食用')
    )
)
r = connection.execute(s).fetchall()        # [(1,), (4,)]
```

##### 运算符

![示例](/images/python/SQLAlchemy快速应用/运算符.png)


##### 其他

```python
from sqlalchemy.sql import func

# example: COUNT
food_type = Table('food_type', metadata, autoload=True, autoload_with=engine)
s = select([func.count(food_type.c.name)])
res = connection.execute(s)
record = res.first()
print(record)               # (5,)
print(record.keys())        # RMKeyView(['count_1'])
# 自动生成的列名，一般格式为:<func_name>_<position>
# AS 别名：
s = select([func.count(food_type.c.name).label('name_count')])
res = connection.execute(s)
record = res.first()
print(record.name_count)        # 5
# res.first().name_count or res.scalar()
print(connection.execute(s).scalar())       # 5
```

#### update

```python
from sqlalchemy import update

food_type = Table('food_type', metadata, autoload=True, autoload_with=engine)
u = update(food_type).where(food_type.c.name == '水果')
u = u.values(updated_time=int(time.time()))
r = connection.execute(u)
print(r.rowcount)
```

#### delete

```python
from sqlalchemy import delete

food_type = Table('food_type', metadata, autoload=True, autoload_with=engine)
u = delete(food_type).where(food_type.c.name == '水果')
r = connection.execute(u)
print(r.rowcount)

# soft delete
```

### 外键

```python
from sqlalchemy import ForeignKeyConstraint, select


food_type = Table('food_type', metadata, autoload=True, autoload_with=engine)
food_name = Table('food_name', metadata, autoload=True, autoload_with=engine)
food_type_name = Table('food_type_name', metadata, autoload=True, autoload_with=engine)

food_type.append_constraint(
    ForeignKeyConstraint(('id',), ['food_type_name.food_type_id'])
)
food_name.append_constraint(
    ForeignKeyConstraint(('id',), ['food_type_name.food_name_id'])
)

# 新增一点数据用于查询
connection.execute(insert(food_name, [{'name': '芒果'}, {'name': '榴莲'}, {'name': '山竹'}, {'name': '椰子'}]))
connection.execute(insert(food_type_name, [
    {'food_type_id': 1, 'food_name_id': 1},
    {'food_type_id': 1, 'food_name_id': 2},
    {'food_type_id': 1, 'food_name_id': 3},
    {'food_type_id': 1, 'food_name_id': 4},
]))

# 连表查询
s = select([
    food_type.c.name.label('food_type_name'),
    food_name.c.name.label('food_name')
])
s = s.where(food_type.c.name == '水果')
s = s.select_from(food_type_name.join(food_type).join(food_name))

r = connection.execute(s)
res = r.fetchall()
"""
[('水果', '芒果'), ('水果', '榴莲'), ('水果', '山竹'), ('水果', '椰子')]
"""
```

---

### 原始查询

复杂查询不知道如何用 `SQLAlchemy` 构造的，写原生SQL。

```python
results = connection.execute("SELECT * FROM food_type;").fetchall()
print(results)

# 部分文本查询
from sqlalchemy import text

s = select([food_type]).where(text("name='水果'"))
print(connection.execute(s).fetchall())
```

---

## SQLAlchemy ORM

SQLAlchemy ORM

---

## 异常和事务

```python
from sqlalchemy.exc import SQLAlchemyError

# 开启事务
transaction = connection.begin()
try:
    # 数据库操作
    data_create()
    data_slelect()
    data_update()
    data_delete()
    # 提交
    transaction.commit()
except SQLAlchemyError as err:
    # 回滚
    transaction.rollback()
    print(error.orig.message, error.params)

```

## Alembic

Alembic 是一个处理数据库更改的工具，它利用 SQLAlchemy 来执行迁移。
