"""
Services module for annotator application.

This module contains business logic for various operations including
model inference, image processing, and data export.
"""

from .inference import InferenceService

__all__ = ['InferenceService']
