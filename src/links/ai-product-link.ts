import AiModule from "../modules/ai/index.js"
import ProductModule from "@medusajs/medusa/product"
import { defineLink } from "@medusajs/framework/utils"

export default defineLink(ProductModule.linkable.product, {
  linkable: AiModule.linkable.aiGeneratedContent,
  isList: true,
})
