from __future__ import unicode_literals

from django.db import models
from datetime import datetime
from django_markdown.models import MarkdownField
from imagekit.models import ImageSpecField
from imagekit.processors import ResizeToFill

# Create your models here.


class Page(models.Model):
    title = models.CharField(max_length=30)
    created_at = models.DateTimeField(default=datetime.now)
    short_description = models. CharField(max_length=255)
    link = models.URLField()
    long_description = MarkdownField()
    image = models.ImageField(upload_to='image/')
    image_thumbnail = ImageSpecField(
        source='image', processors=[ResizeToFill(250, 250)], format='JPEG')
    image_large = ImageSpecField(
        source='image', processors=[ResizeToFill(960, 420)], format='JPEG')
