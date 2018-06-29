# -*- coding: utf-8 -*-

from datetime import datetime
from datetime import timedelta
from app import db

from app.utils import generator_string_id, log

__all__ = ['Robot']


def id_generator():
    return generator_string_id(16, 2)


class Robot(db.Model):
    __tablename__ = 'robot'

    id = db.Column(db.String(32), primary_key=True, default=id_generator)
    robot_id = db.Column(db.String(32), nullable=False)
    name = db.Column(db.String(128), unique=True, nullable=False)
    status = db.Column(db.String(32), nullable=False)
    start_time = db.Column(db.DateTime, nullable=True, default=datetime.now)
    end_time = db.Column(db.DateTime, nullable=True)

    def __init__(self, data):
        self.robot_id = data['robot_id']
        self.name = data['name']
        self.status = data['status']

    @classmethod
    def open(cls, data):
        robot = cls.query.filter_by(name=data['name']).first()
        if robot:
            robot.robot_id = data['robot_id']
            robot.status = 'open'
            robot.start_time = datetime.now()
        else:
            robot = cls(data)
        db.session.add(robot)
        db.session.commit()

    @classmethod
    def close(cls, robot_id):
        robot = cls.query.filter_by(robot_id=robot_id).first()
        if robot:
            robot.status = 'close'
            robot.end_time = datetime.now()
            db.session.add(robot)
            db.session.commit()


