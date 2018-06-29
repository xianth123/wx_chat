# -*- coding: utf-8 -*-

import sys

from app import db

reload(sys)
sys.setdefaultencoding('utf8')

__all__ = ['Sharing']


class Sharing(db.Model):
    __tablename__ = 'sharings'

    id = db.Column(db.String(128), primary_key=True)
    text = db.Column(db.String(256), nullable=True)
    url = db.Column(db.String(256), nullable=False)
    content = db.Column(db.Text, nullable=True)

    def __init__(self, data):
        self.id = data['MsgId']
        self.text = data['Text']
        self.url = data['Url']
        self.content = unicode(str(data['Content']))

    @classmethod
    def create(cls, data):
        sharing = cls.query.filter_by(id=data['MsgId']).first()
        if sharing:
            return sharing
        sharing = cls(data)
        print sharing.to_dict()
        db.session.add(sharing)
        db.session.commit()
        return sharing

    def to_dict(self):
        data = {
            'id': self.id,
            'text': self.text,
            'url': self.url,
            'content': self.content
        }
        return data