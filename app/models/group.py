# -*- coding: utf-8 -*-

from datetime import datetime
from datetime import timedelta
from app import db

from app.utils import generator_string_id, log

__all__ = ['Group']


def id_generator():
    return generator_string_id(16, 2)


class Group(db.Model):
    __tablename__ = 'group'

    id = db.Column(db.String(32), primary_key=True,
                   default=id_generator)
    group_name = db.Column(db.String(128), unique=True)
    amount = db.Column(db.Integer)
    man = db.Column(db.Integer)
    female = db.Column(db.Integer)
    no_sex = db.Column(db.Integer)
    robot = db.Column(db.String(32), nullable=True)

    def __init__(self, data):
        self.group_name = data['group_name']
        self.amount = data['amount']
        self.man = data['man']
        self.female = data['female']
        self.no_sex = data['no_sex']
        self.robot = data['robot']

    @classmethod
    def create(cls, data):
        group = cls.query.filter_by(group_name=data['group_name']).first()
        if group:
            return group
        group = cls(data)
        db.session.add(group)
        db.session.commit()
        return group

    @classmethod
    def update(cls, data):
        group = cls.query.filter_by(group_name=data['group_name']).first()
        if group:
            group.amount = data['amount']
            group.man = data['man']
            group.female = data['female']
            group.no_sex = data['no_sex']
            group.robot = data['robot']
        else:
            group = cls(data)
        db.session.add(group)
        db.session.commit()

    def to_dict(self):
        data = {
            'group_name': self.group_name,
            'amount': self.amount,
            'man': self.man,
            'female': self.female,
            'no_sex': self.no_sex,
            'robot': self.robot,
        }
        return data

    def day_hot(self, n):
        """
        返回过去 几天 内的消息热度，默认为七天
        """
        if n < 1:
            return []
        from app.models import GroupMsg
        # ep = datetime(1970, 1, 1)
        today = datetime.today()
        # dt = datetime(today.year, today.month, today.day) - ep
        dt = datetime(today.year, today.month, today.day)
        timestamp_list = []
        for day in range(n + 1):
            # day_timestamp = (dt - timedelta(days=day)).total_seconds()
            day_timestamp = dt - timedelta(days=day)
            timestamp_list.append(day_timestamp)
        # 获得过去n天内的一个时间戳列表
        hot = []
        query = GroupMsg.query.filter(GroupMsg.group == self.group_name)
        for i in range(n):
            log(str(GroupMsg.create_time), 'time.txt')
            msg_cnt = query.filter(GroupMsg.in_time(timestamp_list[i], timestamp_list[i+1])).count()
            hot.append(msg_cnt)
        return hot

    @property
    def hot(self):
        return self.day_hot(7)

    # @classmethod
    # def create_group_from_name_list(cls, l):
    #     for name in l:
    #         if cls.query.filter_by(group_name=name).first() is None:
    #             cls.insert_one_from_name(name)

    # @classmethod
    # def name_id_dict(cls):
    #     '''
    #     根据group数据库，生成 name：id的一个字典。
    #     '''
    #     return {str(g.group_name): str(g.id) for g in cls.query.all()}

    # @classmethod
    # def id_name_dict(cls):
    #     '''
    #     返回一个 id：group_name 字典
    #     '''
    #     return {str(g.id): str(g.group_name) for g in cls.query.all()}
