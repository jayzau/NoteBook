## 实现软删除

#### 表结构：

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

#### 利用 `sqlalchemy.event` 实现软删除

```python
from sqlalchemy import event, ForeignKeyConstraint
from sqlalchemy.sql import Select, Delete
from sqlalchemy.util.langhelpers import public_factory

# 新增两个方法用于实现软删除以及查询软删除后的数据
# noinspection PyAbstractClass
class SelectWithDeleted(Select):
    select_deleted = True
    inherit_cache = True

# noinspection PyAbstractClass
class SoftDelete(Delete):
    is_soft_delete = True

# noinspection PyProtectedMember
select_with_deleted = public_factory(SelectWithDeleted._create, ".sql.expression.delete")
soft_delete = public_factory(SoftDelete, ".sql.expression.delete")

@event.listens_for(engine, 'before_execute', retval=True)
def _before_execute(conn, clause_element, multi_params, params, execution_options):
    if clause_element.is_insert:
        table = clause_element.table
        t = int(time.time())
        # 创建数据默认追加写入创建时间
        if hasattr(table.c, 'created_time'):
            clause_element = clause_element.values({table.c.created_time: t})
    elif clause_element.is_delete:
        table = clause_element.table
        # 软删除 删除实际为执行为更新删除时间，没有时间字段默认不支持软删，执行原有删除逻辑
        if getattr(clause_element, 'is_soft_delete', False) and hasattr(table.c, 'deleted_time'):
            clause_element = table.update().where(clause_element.whereclause)
            clause_element = clause_element.where(table.c.deleted_time == 0)
            clause_element = clause_element.values({table.c.deleted_time: int(time.time())})
    elif clause_element.is_update:
        table = clause_element.table
        # 更新数据默认追加写入更新时间
        if hasattr(table.c, 'updated_time'):
            clause_element = clause_element.values({table.c.updated_time: int(time.time())})
        # 更新条件过滤掉被软删除的数据
        if hasattr(table.c, 'deleted_time'):
            clause_element = clause_element.where(table.c.deleted_time == 0)
    elif clause_element.is_select:
        # 原有 Select 不含 select_deleted 属性
        select_deleted = getattr(clause_element, 'select_deleted', False)
        # 查询默认过滤掉被软删除后的数据
        if not select_deleted:
            for table in clause_element.columns_clause_froms:
                if hasattr(table.c, 'deleted_time'):
                    clause_element = clause_element.where(table.c.deleted_time == 0)
    return clause_element, multi_params, params
```

#### 测试

```python
# 连表
food_type = Table('food_type', metadata, autoload=True, autoload_with=engine)
food_name = Table('food_name', metadata, autoload=True, autoload_with=engine)
food_type_name = Table('food_type_name', metadata, autoload=True, autoload_with=engine)

food_type.append_constraint(
    ForeignKeyConstraint(('id',), ['food_type_name.food_type_id'])
)
food_name.append_constraint(
    ForeignKeyConstraint(('id',), ['food_type_name.food_name_id'])
)
```

查询测试：

```python
# 清空所有数据
connection.execute(delete(food_type))
connection.execute(delete(food_name))
connection.execute(delete(food_type_name))
# 新增测试数据，不带任何时间参数
food_type_data = [
    {'name': '水果', 'description': '水果，是指多汁且主要味觉为甜味和酸味，可食用的植物果实。'},
    {'name': '蔬菜', 'description': '蔬菜(vegetables)是指可以做菜、烹饪成为食品的一类植物或菌类。'},
    {'name': '干货', 'description': '干货是指去除了水分或水分较少的初级产品的统称。'},
    {'name': '肉类', 'description': '肉类，是动物的皮下组织及肌肉，可以食用。'},
    {'name': '水产', 'description': ''}
]
food_name_data = [
    {'name': '香蕉'},
    {'name': '苹果'},
    {'name': '西瓜'},
    {'name': '哈密瓜'},
    {'name': '脆瓜'},
]
i = insert(food_type)
res = connection.execute(i, food_type_data)
"""<sqlalchemy.engine.cursor.LegacyCursorResult object at 0x7f7ee002c5d0>"""
i = insert(food_name)
res = connection.execute(i, food_name_data)
"""<sqlalchemy.engine.cursor.LegacyCursorResult object at 0x7f7ee002cd50>"""

# 查询数据
s = select(food_type).where(food_type.c.name == '水产')
res = connection.execute(s)
food_type_record = res.first()
"""food_type_record: (5, '水产', '', 1679283322, 0, 0)"""
res = connection.execute(select(food_name))
food_name_records = res.fetchall()
""" food_name_records:
[
    (1, '香蕉', '', 1679283322, 0, 0), 
    (2, '苹果', '', 1679283322, 0, 0), 
    (3, '西瓜', '', 1679283322, 0, 0), 
    (4, '哈密瓜', '', 1679283322, 0, 0), 
    (5, '脆瓜', '', 1679283322, 0, 0)
]
"""
# 查询结果已有写入时间

food_type_id = connection.execute(select(food_type.c.id).where(food_type.c.name == '水果')).scalar()
data = []
for r in food_name_records:
    data.append({
        'food_type_id': food_type_id,
        'food_name_id': r.id
    })
connection.execute(insert(food_type_name), data)

# 更新数据，不带任何时间参数
u = update(food_type).where(food_type.c.name == '水产')
u = u.values({food_type.c.description: '水产是指江、河、湖、海里出产的经济动、植物的统称。'})
res = connection.execute(u)
print(res)
"""<sqlalchemy.engine.cursor.LegacyCursorResult object at 0x7f7ef002c990>"""
print(connection.execute(select(food_type).where(food_type.c.name == '水产')).first())
"""(5, '水产', '水产是指江、河、湖、海里出产的经济动、植物的统称。', 1679283322, 1679283322, 0)"""
# 更新结果已自动带入了时间

# soft_delete 软删除数据
d = soft_delete(food_name).where(food_name.c.name.like('%瓜'))
res = connection.execute(d)
"""<sqlalchemy.engine.cursor.LegacyCursorResult object at 0x7f7ef003c950>"""
# select 查询数据
s = select([
    food_type.c.name.label('food_type_name'),
    food_name.c.name.label('food_name'),
    food_name.c.deleted_time.label('deleted_time')
])
s = s.select_from(food_type_name.join(food_type).join(food_name))
res = connection.execute(s)
results = res.fetchall()
print(results)
"""
[
    ('水果', '香蕉', 0), 
    ('水果', '苹果', 0)
]
"""
# select 查询不到被软删的数据

# select_with_deleted 查询(包含软删除的数据)
s = select_with_deleted([
    food_type.c.name.label('food_type_name'),
    food_name.c.name.label('food_name'),
    food_name.c.deleted_time.label('deleted_time')
])
s = s.select_from(food_type_name.join(food_type).join(food_name))
res = connection.execute(s)
results = res.fetchall()
print(results)
"""
[
    ('水果', '香蕉', 0), 
    ('水果', '苹果', 0), 
    ('水果', '西瓜', 1679283322), 
    ('水果', '哈密瓜', 1679283322), 
    ('水果', '脆瓜', 1679283322)
]
"""
# select_with_deleted 结果包含被软删的数据

# delete 删除数据
d = delete(food_name).where(food_name.c.name == '脆瓜')
res = connection.execute(d)
print(res)
"""<sqlalchemy.engine.cursor.LegacyCursorResult object at 0x7f7ef00483d0>"""

# select_with_deleted 查询数据
s = select_with_deleted([
    food_type.c.name.label('food_type_name'),
    food_name.c.name.label('food_name'),
    food_name.c.deleted_time.label('deleted_time'),
])
s = s.select_from(food_type_name.join(food_type).join(food_name))
res = connection.execute(s)
results = res.fetchall()
print(results)
"""
[
    ('水果', '香蕉', 0), 
    ('水果', '苹果', 0), 
    ('水果', '西瓜', 1679283322), 
    ('水果', '哈密瓜', 1679283322)
]
"""
# 脆瓜相关数据已从数据库移除
```
