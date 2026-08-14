# @sai/dsh-vision

Vision routing for sai. Image-capable conversation models receive attachments
directly. For an explicitly text-only model, the plugin asks an image-capable
model for a structured observation and substitutes that observation only in the
model request; the durable DSH transcript keeps the original attachment.

Selection order is the current provider first, then an explicitly configured
`fallbackProvider` and `fallbackModel`. The main conversation model is never
changed.
